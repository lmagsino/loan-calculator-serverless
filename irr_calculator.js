const irrCalculator = {

  AEY: function(r, c) {
    if (r === 0.0) return 0.0
  	if (c === 0.0) return Math.exp(r) - 1
  	else return Math.pow(1.0 + r * c, 1 / c) - 1
  },

  PVIF: function(r, n, c) {
    c = (typeof c !== "undefined") ? c : 1
    if (r === 0.0) return 1.0
    if (n === 0.0) return 1.0
    return Math.pow(1.0 + this.AEY(r, c), -n)
  },

  PVIFbar: function(r, n, c) {
    c = (typeof c !== "undefined") ? c : 1
    if (r === 0.0) return -n
    if (n === 0.0) return 0.0
    return -n * this.PVIF(r, n + c, c)
  },

  NPV: function(r, cfs, atype, c, p, d) {
    let npv = 0.0
    let cf, i, t

    atype = (typeof atype !== "undefined") ? atype : 1
    c = (typeof c !== "undefined") ? c : 1
    p = (typeof p !== "undefined") ? p : 1
    d = (typeof d !== "undefined") ? d : 1

    for (i = 0; i < cfs.length; i++) {
      if (atype === 0) t = i * p + d * p
      else {
        if (i === 0) t = 0
        else t = (i - 1) * p + d * p
      }

      cf = cfs[i]
      npv += cf * this.PVIF(r, t, c)
    }

    return npv
  },

  NPVbar: function(r, cfs, atype, c, p, d) {
    let npv = 0.0
    let cf, i, t

    atype = (typeof atype !== "undefined") ? atype : 1
    c = (typeof c !== "undefined") ? c : 1
    p = (typeof p !== "undefined") ? p : 1
    d = (typeof d !== "undefined") ? d : 1

    for (i = 0; i < cfs.length; i++) {
      if (atype === 0) t = i * p + d * p
      else {
        if (i === 0) t = 0
        else t = (i - 1) * p + d * p
      }

      cf = cfs[i]
      npv += cf * this.PVIFbar(r, t, c)
    }

    return npv
  },

  IRR: function(cfs, atype, guess, c, p, d) {
    guess = (typeof guess === "undefined") ? 0.10 : guess
    atype = (typeof atype !== "undefined") ? atype : 1
    c = (typeof c !== "undefined") ? c : 1
    p = (typeof p !== "undefined") ? p : 1
    d = (typeof d !== "undefined") ? d : 1

    let i, f, fbar
    let x = 0.0
    let x0 = guess

    for (i = 0; i < 100; i++) {
      f = this.NPV(x0, cfs, atype, c, p, d)
      fbar = this.NPVbar(x0, cfs, atype, c, p, d)

      if (fbar === 0.0) return null
      else x = x0 - f / fbar

      if ( Math.abs(x-x0) < 0.000001 ) return x

      x0 = x
    }

    return null
  }
}

module.exports.calculator = irrCalculator
