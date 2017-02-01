describe("O", () => {
  const O = require('../main-process/o')

  it("initialize with string", () => {
    var file, expected, o
    file = "1"
    expected = ["1"]
    o = new O(file)
    expect(o.structure).toEqual(expected)

    file = "001"
    expected = ["001"]
    o = new O(file)
    expect(o.structure).toEqual(expected)

    file = "11_s_11"
    expected = ["11", "_s_", "11"]
    o = new O(file)
    expect(o.structure).toEqual(expected)

    file = "a_01"
    expected = ["a_", "01"]
    o = new O(file)
    expect(o.structure).toEqual(expected)

    file = "2_s_02_01_t_110"
    expected = ["2", "_s_", "02", "_", "01", "_t_", "110"]
    o = new O(file)
    expect(o.structure).toEqual(expected)
  })
})
