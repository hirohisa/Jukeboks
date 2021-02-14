describe("FileOrganizer", () => {
  const organizer = require('../src/file_utils')

  describe("when finder sorts dirs ", () => {
    it("should be possible to sort ascending numbers ", () => {
      var dirs = [
        "1", "2", "3", "4", "5", "13", "21",
      ]

      var expected = [
        "1", "2", "3", "4", "5", "13", "21",
      ]

      expect(dirs.sort(organizer.sortAlgorithm)).toEqual(expected)
    })

    it("should be possible to sort random numbers", () => {
      var dirs = [
        "3", "21", "4", "1", "13", "2", "5",
      ]

      var expected = [
        "1", "2", "3", "4", "5", "13", "21",
      ]

      expect(dirs.sort(organizer.sortAlgorithm)).toEqual(expected)
    })

    it("should be possible to sort complex numbers", () => {
      var dirs = [
        "001", "002", "013", "014", "015", "103", "113", "123",
      ]

      var expected = [
        "001", "002", "013", "014", "015", "103", "113", "123",
      ]

      expect(dirs.sort(organizer.sortAlgorithm)).toEqual(expected)
    })

    it("should be possible to sort mixed string ", () => {
      var dirs = [
        "11_s_11", "a_01", "3_s_03", "10_s_10", "1_s_01", "a_11", "t_01", "2_s_02", "s_01", "s_02", "s_03",
      ]

      var expected = [
        "1_s_01", "2_s_02", "3_s_03", "10_s_10", "11_s_11", "a_01", "a_11", "s_01", "s_02", "s_03", "t_01",
      ]

      expect(dirs.sort(organizer.sortAlgorithm)).toEqual(expected)
    })

    it("should be possible to sort mixed string that has prefix is not number", () => {
      var dirs = [
        "西暦2020年1月05日", "西暦2019年11月21日", "西暦2020年1月01日", "西暦2019年12月2日", "西暦2019年12月21日", "西暦2020年1月2日", "西暦2020年1月21日", "西暦2020年1月2日",
      ]

      var expected = [
        "西暦2019年11月21日", "西暦2019年12月2日", "西暦2019年12月21日", "西暦2020年1月01日", "西暦2020年1月2日", "西暦2020年1月2日", "西暦2020年1月05日", "西暦2020年1月21日",
      ]

      expect(dirs.sort(organizer.sortAlgorithm)).toEqual(expected)
    })

  })

})

describe("structure test", () => {
  const organizer = require('../src/file_utils')

  it("initialize with string", () => {
    var str, expected
    str = "1"
    expected = ["1"]
    expect(organizer.structure(str)).toEqual(expected)

    str = "001"
    expected = ["001"]
    expect(organizer.structure(str)).toEqual(expected)

    str = "11_s_11"
    expected = ["11", "_s_", "11"]
    expect(organizer.structure(str)).toEqual(expected)

    str = "a_01"
    expected = ["a_", "01"]
    expect(organizer.structure(str)).toEqual(expected)

    str = "2_s_02_01_t_110"
    expected = ["2", "_s_", "02", "_", "01", "_t_", "110"]
    expect(organizer.structure(str)).toEqual(expected)

  })
})
