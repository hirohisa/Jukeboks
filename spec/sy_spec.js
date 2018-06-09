describe("Sy", () => {
  const system = require('../lib/sy')

  describe("when finder check unused directory", () => {
    it("try several patterns", () => {
      expect(system.keepDirectory("/User/hirohisa", "/User/hirohisa")).toEqual(true)
      expect(system.keepDirectory("/User/hirohisa", "/User/hirohisa/d1")).toEqual(false)
      expect(system.keepDirectory("/User/hirohisa/d1", "/User/hirohisa/d2")).toEqual(false)
      expect(system.keepDirectory("/User/hirohisa/d1", "/User/hirohisa")).toEqual(true)
      expect(system.keepDirectory("/User/hirohisa/d1", "/User/hirohisa/")).toEqual(true)
    })
  })
})
