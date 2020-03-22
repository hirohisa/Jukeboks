describe("O", () => {
  const O = require('../src/o')

  it("initialize with string", () => {
    var dirent, expected, o
    dirent = { name: "1" }
    expected = ["1"]
    o = new O(dirent)
    expect(o.structure).toEqual(expected)

    dirent = { name: "001" }
    expected = ["001"]
    o = new O(dirent)
    expect(o.structure).toEqual(expected)

    dirent = { name: "11_s_11" }
    expected = ["11", "_s_", "11"]
    o = new O(dirent)
    expect(o.structure).toEqual(expected)

    dirent = { name: "a_01" }
    expected = ["a_", "01"]
    o = new O(dirent)
    expect(o.structure).toEqual(expected)

    dirent = { name: "2_s_02_01_t_110" }
    expected = ["2", "_s_", "02", "_", "01", "_t_", "110"]
    o = new O(dirent)
    expect(o.structure).toEqual(expected)
  })
})
