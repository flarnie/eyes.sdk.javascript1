;(function() {
  'use strict'

  var PropertyHandler = require('./PropertyHandler').PropertyHandler

  /**
   * A property handler for read-only properties (i.e., set always fails).
   *
   * @constructor
   * @param {Logger} [logger]
   * @param {*} [obj] The object to set.
   **/
  function ReadOnlyPropertyHandler(logger, obj) {
    this._logger = logger
    this._obj = obj || null
  }

  ReadOnlyPropertyHandler.prototype = new PropertyHandler()
  ReadOnlyPropertyHandler.prototype.constructor = ReadOnlyPropertyHandler

  // noinspection JSUnusedLocalSymbols
  /**
   * @param {*} obj The object to set.
   * @return {boolean} {@code true} if the object was set, {@code false} otherwise.
   */
  ReadOnlyPropertyHandler.prototype.set = function(obj) {
    this._logger.verbose('Ignored. (%s)', 'ReadOnlyPropertyHandler')
    return false
  }

  /**
   * @return {*} The object that was set. (Note that object might also be set in the constructor of an implementation class).
   */
  ReadOnlyPropertyHandler.prototype.get = function() {
    return this._obj
  }

  exports.ReadOnlyPropertyHandler = ReadOnlyPropertyHandler
})()
