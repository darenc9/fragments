// src/model/fragment.js
// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const Response = require('../response');
const markdown = require('markdown-it');
let md = new markdown();
const sharp = require('sharp');
const { parse } = require('csv-parse/sync');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId)
      throw new Error(`ownerId is required`);
    if (!type)
      throw new Error(`type is required`);
    if (typeof size !== 'number')
      throw new Error(`size must be a number`);
    if (size < 0) 
      throw new Error(`Size cannot be negative`);
    if (!Fragment.isSupportedType(type)){
      throw new Error('Unsupported content type.');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    return fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragmentData = await readFragment(ownerId, id);
    if (!fragmentData) {
      throw new Error(`Fragment not found for ownerId: ${ownerId} and id: ${id}`);
    }
    return new Fragment(fragmentData);
  }
  

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    return await deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    return await writeFragment({
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: new Date().toISOString(),
      type: this.type,
      size: this.size,
    });
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!(data instanceof Buffer)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();
    await this.save();
    await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return ['text/plain'];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    const supportedTypes = [
      'text/plain',
      'text/plain; charset=utf-8',
      'text/markdown',
      'text/html',
      'text/csv',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ];
    return supportedTypes.includes(type);
  }

  // Returns true if we can work with this type of image
  static isSupportedImageType(value) {
    //const { type } = contentType.parse(value);
    const supportedMediaTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif', 'image/gif'];
    const supportedImageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif'];
  
    // Check if the content type is in the list of supported media types
    if (supportedMediaTypes.includes(value))
      return true;
  
    // Extract file extension from the content type
    const extension = value.split('/').pop().toLowerCase();
    return supportedImageExtensions.includes(extension);
  }

  // Returns true if we can work with this type of text file
  static isSupportedTextType(value) {
    const supportedTextTypes = ['text/plain', 'text/markdown', 'text/html', 'text/csv', 'application/json'];
    const supportedTextExtensions = ['txt', 'md', 'html', 'csv', 'json'];

    if (supportedTextTypes.includes(value))
      return true;

    const extension = value.split('/').pop().toLowerCase();
    return supportedTextExtensions.includes(extension);
  }

  // Returns converted image
  async convertImage(extension) {
    if (!Fragment.isSupportedImageType(this.type) || !Fragment.isSupportedImageType(extension)) {
      throw Response.createErrorResponse(415, 'Unsupported image type');
    }
    try {
      const fragData = await this.getData();
  
      if (this.type.split('/')[1].toLowerCase() === extension.toLowerCase()) 
        return fragData;
      
      return await sharp(fragData).toFormat(extension).toBuffer();

      } catch (error) {
          console.error('Error converting image:', error);
          throw new Error(`Conversion from ${this.type} to ${extension} is not supported.`);
      }
  }

  // Returns converted text types
  async convertText(extension) {
    if (!Fragment.isSupportedTextType(this.type) || !Fragment.isSupportedTextType(extension)) {
      throw Response.createErrorResponse(415, 'Unsupported text type');
    }
    let fragData;
    try {
      fragData = await this.getData();
    } catch (error) {
      throw new Error('Error fetching fragment data');
    }

    if (this.type.split('/')[1].toLowerCase() === extension.toLowerCase())
      return fragData;

    switch (extension) {
      case 'txt':
        return fragData;
      
      case 'html':
        if (this.type.includes('text/markdown'))
          return md.render(fragData.toString());
        else
          throw Response.createErrorResponse(415, 'Unsupported conversion type');

      case 'json':
        if (this.type.includes('text/csv')) {
          // try csv to json conversion
          try {
            const records = parse(fragData, {
                columns: true,
                skip_empty_lines: true
            });
            return JSON.stringify(records);
          } catch (error) {
            throw Response.createErrorResponse(500, 'Error converting csv to json');
          }
        }
        throw Response.createErrorResponse(415, 'Unsupported conversion type');

        default:
          throw Response.createErrorResponse(415, 'Unsupported conversion type');
    }
  }
}

module.exports.Fragment = Fragment;