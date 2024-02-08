const {
    listFragments,
    writeFragment,
    readFragment,
    writeFragmentData,
    readFragmentData,
    deleteFragment,
  }  = require('../../src/model/data/memory/index.js');

  describe('memory', () => {
    const ownerId = 'test';
    const fragmentId = 'fragtest';
    const fragmentData = Buffer.from('Test data');

    // test for writeFragment and readFragment
    test('writeFragment and readFragment function test', async () => {
        const fragment = {ownerId, id: fragmentId, fragmentData};
        await writeFragment(fragment);
        const result = await readFragment(fragment.ownerId, fragment.id);
        expect(result).toEqual(fragment);
    });

    // test for readFragmentData
    test('readFragmentData function test', async () => {
        const fragment = {ownerId, id: fragmentId, fragmentData};
        await writeFragment(fragment);
        const result = await readFragment(fragment.ownerId, fragment.id);
        expect(result).toEqual(fragment);
    });
    
    // test for writeFragmentData
    test('writeFragmentData should add data to data database', async () => {
        await writeFragmentData(ownerId, fragmentId, fragmentData);
        const storedData = await readFragmentData(ownerId, fragmentId);
        expect(storedData).toEqual(fragmentData);
    });

    // test for listFragments
    test('listFragments should return an array of fragment ids', async () => {
        const fragments = await listFragments(ownerId);
        expect(Array.isArray(fragments)).toBe(true);
    });

    // test for deleteFragment
    test('deleteFragment should remove fragment from metadata and data', async () => {
        await deleteFragment(ownerId, fragmentId);
        const deletedFragment = await readFragment(ownerId, fragmentId);
        const deletedData = await readFragmentData(ownerId, fragmentId);
        expect(deletedFragment).toBeUndefined();
        expect(deletedData).toBeUndefined();
    });

  })