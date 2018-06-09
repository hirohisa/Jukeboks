describe("FileOrganizer", () => {
  const organizer = require('../lib/file_organizer')

  describe("when finder sorts files", () => {
    it("should be possible to sort ascending numbers", () => {
      var files = [
        "1", "2", "3", "4", "5", "13", "21"
      ]

      var expected = [
        "1", "2", "3", "4", "5", "13", "21"
      ]

      expect(organizer.sortFiles(files)).toEqual(expected)
    })

    it("should be possible to sort random numbers", () => {
      var files = [
        "3", "21", "4", "1", "13", "2", "5"
      ]

      var expected = [
        "1", "2", "3", "4", "5", "13", "21"
      ]

      expect(organizer.sortFiles(files)).toEqual(expected)
    })

    it("should be possible to sort complex numbers", () => {
      var files = [
        "001", "002", "013", "014", "015", "103", "113", "123"
      ]

      var expected = [
        "001", "002", "013", "014", "015", "103", "113", "123"
      ]

      expect(organizer.sortFiles(files)).toEqual(expected)
    })

    it("should be possible to sort mixed string", () => {
      var files = [
        "11_s_11", "a_01", "3_s_03", "10_s_10", "1_s_01", "a_11", "t_01", "2_s_02", "s_01", "s_02", "s_03"
      ]

      var expected = [
        "1_s_01", "2_s_02", "3_s_03", "10_s_10", "11_s_11", "a_01", "a_11", "s_01", "s_02", "s_03", "t_01"
      ]

      expect(organizer.sortFiles(files)).toEqual(expected)
    })

  })

})
