describe("FileOrganizer", () => {
  const organizer = require('../src/file_utils')

  describe("when finder sorts files ", () => {
    it("should be possible to sort ascending numbers ", () => {
      var files = [
        { name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }, { name: "5" }, { name: "13" }, { name: "21" },
      ]

      var expected = [
        { name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }, { name: "5" }, { name: "13" }, { name: "21" },
      ]

      expect(organizer.sort(files)).toEqual(expected)
    })

    it("should be possible to sort random numbers", () => {
      var files = [
        { name: "3" }, { name: "21" }, { name: "4" }, { name: "1" }, { name: "13" }, { name: "2" }, { name: "5" },
      ]

      var expected = [
        { name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }, { name: "5" }, { name: "13" }, { name: "21" },
      ]

      expect(organizer.sort(files)).toEqual(expected)
    })

    it("should be possible to sort complex numbers", () => {
      var files = [
        { name: "001" }, { name: "002" }, { name: "013" }, { name: "014" }, { name: "015" }, { name: "103" }, { name: "113" }, { name: "123" },
      ]

      var expected = [
        { name: "001" }, { name: "002" }, { name: "013" }, { name: "014" }, { name: "015" }, { name: "103" }, { name: "113" }, { name: "123" },
      ]

      expect(organizer.sort(files)).toEqual(expected)
    })

    it("should be possible to sort mixed string ", () => {
      var files = [
        { name: "11_s_11" }, { name: "a_01" }, { name: "3_s_03" }, { name: "10_s_10" }, { name: "1_s_01" }, { name: "a_11" }, { name: "t_01" }, { name: "2_s_02" }, { name: "s_01" }, { name: "s_02" }, { name: "s_03" },
      ]

      var expected = [
        { name: "1_s_01" }, { name: "2_s_02" }, { name: "3_s_03" }, { name: "10_s_10" }, { name: "11_s_11" }, { name: "a_01" }, { name: "a_11" }, { name: "s_01" }, { name: "s_02" }, { name: "s_03" }, { name: "t_01" },
      ]

      expect(organizer.sort(files)).toEqual(expected)
    })

  })

})
