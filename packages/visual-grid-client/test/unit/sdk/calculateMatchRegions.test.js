'use strict'

const {describe, it} = require('mocha')
const {expect} = require('chai')
const calculateMatchRegions = require('../../../src/sdk/calculateMatchRegions')

describe('calculateMatchRegions', () => {
  it('handles null ignore regions', () => {
    const regions = calculateMatchRegions({
      userRegions: [undefined, undefined, undefined, undefined, undefined, undefined],
    })
    expect(regions).to.eql([undefined, undefined, undefined, undefined, undefined, undefined])
  })

  it('handles non-selector no-offset ignore regions', () => {
    const ignore = ['bla']
    const userRegions = [ignore, undefined, undefined, undefined, undefined, undefined]
    expect(calculateMatchRegions({userRegions})).to.eql([
      ignore,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ])
  })

  it('handles single no-offset region', () => {
    const ignore = {bla: 'kuku'}
    const userRegions = [[ignore], undefined, undefined, undefined, undefined, undefined]
    const res = calculateMatchRegions({userRegions})
    expect(res).to.eql([[ignore], undefined, undefined, undefined, undefined, undefined])
  })

  it('handles single no-offset region with type', () => {
    const accessibility = {bla: 'kuku', accessibilityType: 'RegularText'}
    const userRegions = [undefined, undefined, undefined, [accessibility]]
    expect(calculateMatchRegions({userRegions})).to.eql([
      undefined,
      undefined,
      undefined,
      [accessibility],
    ])
  })

  it('handles single no-offset with order region', () => {
    const ignore = {bla: 'kuku'}
    const layout = {bla: 'kuku'}
    const content = {bla: 'kuku'}
    const userRegions = [ignore, undefined, layout, content, undefined, undefined]
    expect(calculateMatchRegions({userRegions})).to.eql([
      [ignore],
      undefined,
      [layout],
      [content],
      undefined,
      undefined,
    ])
  })

  it('handles single no-offset with order region and types', () => {
    const a1 = {bla: 'kuku', accessibilityType: 'LargeText'}
    const a2 = {bla: 'kuku', accessibilityType: 'RegularText'}
    const userRegions = [undefined, undefined, [a2], [a1], undefined, undefined]
    expect(calculateMatchRegions({userRegions})).to.eql([
      undefined,
      undefined,
      [a2],
      [a1],
      undefined,
      undefined,
    ])
  })

  it('handles no-offset exact region with order region and types', () => {
    const a1 = {top: 100, left: 0, width: 1000, height: 100, accessibilityType: 'LargeText'}
    const a2 = {top: 2, left: 2, width: 2, height: 2, accessibilityType: 'RegularText'}
    const userRegions = [undefined, undefined, [a1], [a2], undefined, undefined]
    expect(calculateMatchRegions({userRegions})).to.eql([
      undefined,
      undefined,
      [a1],
      [a2],
      undefined,
      undefined,
    ])
  })

  it('handles single offset region', () => {
    const floating = {bla: 'kuku'}
    const userRegions = [undefined, undefined, undefined, undefined, undefined, [floating]]
    expect(calculateMatchRegions({userRegions})).to.eql([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [floating],
    ])
  })

  it('handles offset region with order', () => {
    const floating = {bla: 'kuku'}
    const whatever = {bla: 'whatever'}
    const userRegions = [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [whatever, floating],
    ]
    expect(calculateMatchRegions({userRegions})).to.eql([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [whatever, floating],
    ])
  })

  it('handles single no-offset region in middle of array with order', () => {
    const layout = [{selector: 'kuku'}]
    const userRegions = [undefined, layout, undefined, undefined, undefined, undefined]
    expect(
      calculateMatchRegions({userRegions, selectorRegions: [[{toJSON: () => 'kuku'}]]}),
    ).to.eql([undefined, ['kuku'], undefined, undefined, undefined, undefined])
  })

  it('handles no-offset regions without image offset', () => {
    const ignore = [{selector: 'bla'}, {selector: 'kuku'}]
    const layout = [{selector: 'bla2'}]
    const strict = [{selector: 'bla3'}, {selector: 'kuku3'}]

    const selectorRegions = [
      [{toJSON: () => 'aaa'}],
      [{toJSON: () => 'bbb'}],
      [{toJSON: () => 'ccc'}],
      [{toJSON: () => 'ddd'}],
      [{toJSON: () => 'eee'}],
    ]
    const userRegions = [ignore, layout, strict]
    expect(calculateMatchRegions({userRegions, selectorRegions})).to.eql([
      ['aaa', 'bbb'],
      ['ccc'],
      ['ddd', 'eee'],
    ])
  })

  it('handles selector offset-regions without image offset', () => {
    const floating = [{selector: 'bla'}, {selector: 'kuku'}]
    const selectorRegions = [[{toJSON: () => 'aaa'}], [{toJSON: () => 'bbb'}]]
    const userRegions = [undefined, undefined, undefined, floating]
    expect(calculateMatchRegions({userRegions, selectorRegions})).to.eql([
      undefined,
      undefined,
      undefined,
      ['aaa', 'bbb'],
    ])
  })

  it('handles non-offset regions *with* image offset', () => {
    const ignore = [{selector: 'bla'}]
    const layout = [{selector: 'bla2'}]
    const strict = [{selector: 'bla3'}]
    const content = [{selector: 'bla4'}]

    const selectorRegions = [
      [],
      [{getLeft: () => 1, getTop: () => 2, getWidth: () => 3, getHeight: () => 4}],
      [{getLeft: () => 1, getTop: () => 2, getWidth: () => 4, getHeight: () => 4}],
      [{getLeft: () => 1, getTop: () => 2, getWidth: () => 5, getHeight: () => 4}],
      [{getLeft: () => 11, getTop: () => 22, getWidth: () => 55, getHeight: () => 44}],
    ]
    const imageLocationRegion = {getLeft: () => 1, getTop: () => 2}
    const userRegions = [ignore, layout, strict, content]
    expect(
      calculateMatchRegions({
        userRegions,
        selectorRegions,
        imageLocationRegion,
      }),
    ).to.eql([
      [
        {
          width: 3,
          height: 4,
          left: 0,
          top: 0,
        },
      ],
      [
        {
          width: 4,
          height: 4,
          left: 0,
          top: 0,
        },
      ],
      [
        {
          width: 5,
          height: 4,
          left: 0,
          top: 0,
        },
      ],
      [
        {
          height: 44,
          left: 10,
          top: 20,
          width: 55,
        },
      ],
    ])
  })

  it('handles selector non-offset regions *with* image offset, correcting negative coordinates in output', () => {
    const ignore = [{selector: 'bla'}]
    const layout = [{selector: 'bla2'}]
    const strict = [{selector: 'bla3'}]
    const content = [{selector: 'bla4'}]
    const selectorRegions = [
      [],
      [{getLeft: () => 1, getTop: () => 2, getWidth: () => 3, getHeight: () => 4}],
      [{getLeft: () => 2, getTop: () => 2, getWidth: () => 3, getHeight: () => 4}],
      [{getLeft: () => 0, getTop: () => 2, getWidth: () => 3, getHeight: () => 4}],
      [{getLeft: () => 10, getTop: () => 20, getWidth: () => 30, getHeight: () => 40}],
    ]
    const imageLocationRegion = {getLeft: () => 3, getTop: () => 4}
    const userRegions = [ignore, layout, strict, content]
    expect(calculateMatchRegions({userRegions, selectorRegions, imageLocationRegion})).to.eql([
      [
        {
          width: 3,
          height: 4,
          left: 0,
          top: 0,
        },
      ],
      [
        {
          width: 3,
          height: 4,
          left: 0,
          top: 0,
        },
      ],
      [
        {
          width: 3,
          height: 4,
          left: 0,
          top: 0,
        },
      ],
      [
        {
          height: 40,
          left: 7,
          top: 16,
          width: 30,
        },
      ],
    ])
  })

  it('handles combined non-selector non-offset regions and normal non-offset regions', () => {
    const ignore = ['kuku', {selector: 'bla'}]
    const layout = [{selector: 'bla2'}, 'kuku2']
    const strict = [{selector: 'bla3'}, {selector: 'clams3'}, 'kuku3']
    const content = [{selector: 'bla4'}, 'kuku3']

    const selectorRegions = [
      [{toJSON: () => 'aaa'}],
      [{toJSON: () => 'bbb'}],
      [{toJSON: () => 'ccc'}],
      [{toJSON: () => 'ddd'}],
      [{toJSON: () => 'eee'}],
      [{toJSON: () => 'fff'}],
      [{toJSON: () => 'ggg'}],
      [{toJSON: () => 'hhh'}],
      [{toJSON: () => 'jjj'}],
    ]
    const userRegions = [ignore, layout, strict, content]
    expect(calculateMatchRegions({userRegions, selectorRegions})).to.eql([
      ['kuku', 'aaa'],
      ['bbb', 'kuku2'],
      ['ccc', 'ddd', 'kuku3'],
      ['eee', 'kuku3'],
    ])
  })

  it('handles offset and non-offset regions', () => {
    const offset = x => ({
      maxUpOffset: x + 1,
      maxDownOffset: x + 1,
      maxRightOffset: x + 1,
      maxLeftOffset: x + 1,
    })
    const ignore = ['kuku', {selector: 'bla'}, 'bubu', {selector: 'clams'}]
    const layout = [{selector: 'bla2'}, 'bubu2']
    const strict = ['kuku2', {selector: 'bla'}, 'bubu3', 'dudu3', {selector: 'bla'}]
    const content = [{selector: 'blaaa'}, 'aaa3']
    const floating = [{kuku: 'kuku'}, {selector: 'bla'}].map((x, i) => Object.assign(x, offset(i)))
    const selectorRegions = [
      [{toJSON: () => 'aaa'}],
      [{toJSON: () => 'bbb'}],
      [{toJSON: () => 'ccc'}],
      [{toJSON: () => 'ddd'}],
      [{toJSON: () => 'eee'}],
      [{toJSON: () => 'fff'}],
    ]
    const userRegions = [ignore, layout, strict, content, floating]
    expect(calculateMatchRegions({userRegions, selectorRegions})).to.eql([
      ['kuku', 'aaa', 'bubu', 'bbb'],
      ['ccc', 'bubu2'],
      ['kuku2', 'ddd', 'bubu3', 'dudu3', 'eee'],
      ['fff', 'aaa3'],
      [{kuku: 'kuku'}].map((x, i) => Object.assign(x, offset(i))),
    ])
  })
})
