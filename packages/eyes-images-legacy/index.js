'use strict'

exports.Eyes = require('./src/Eyes').Eyes
exports.ImageProvider = require('./src/ImageProvider').ImageProvider

var EyesSDK = require('eyes.sdk')
exports.ConsoleLogHandler = EyesSDK.ConsoleLogHandler
exports.ContextBasedScaleProvider = EyesSDK.ContextBasedScaleProvider
exports.ContextBasedScaleProviderFactory = EyesSDK.ContextBasedScaleProviderFactory
exports.CoordinatesType = EyesSDK.CoordinatesType
exports.CutProvider = EyesSDK.CutProvider
// exports.EyesBase = EyesSDK.EyesBase;
exports.FailureReport = EyesSDK.EyesBase.FailureReport
exports.TestResultsStatus = EyesSDK.EyesBase.TestResultsStatus
exports.EyesScreenshot = EyesSDK.EyesScreenshot
exports.FileLogHandler = EyesSDK.FileLogHandler
exports.FixedCutProvider = EyesSDK.FixedCutProvider
exports.FixedScaleProvider = EyesSDK.FixedScaleProvider
exports.FixedScaleProviderFactory = EyesSDK.FixedScaleProviderFactory
exports.Logger = EyesSDK.Logger
exports.LogHandler = EyesSDK.LogHandler
exports.MatchSettings = EyesSDK.MatchSettings
exports.MatchLevel = EyesSDK.MatchSettings.MatchLevel
exports.ImageMatchSettings = EyesSDK.MatchSettings.ImageMatchSettings
exports.ExactMatchSettings = EyesSDK.MatchSettings.ExactMatchSettings
exports.MutableImage = EyesSDK.MutableImage
exports.NullCutProvider = EyesSDK.NullCutProvider
exports.NullLogHandler = EyesSDK.NullLogHandler
exports.NullScaleProvider = EyesSDK.NullScaleProvider
exports.PositionProvider = EyesSDK.PositionProvider
exports.RegionProvider = EyesSDK.RegionProvider
exports.RemoteSessionEventHandler = EyesSDK.RemoteSessionEventHandler
exports.ScaleProvider = EyesSDK.ScaleProvider
exports.ScaleProviderFactory = EyesSDK.ScaleProviderFactory
exports.ScaleProviderIdentityFactory = EyesSDK.ScaleProviderIdentityFactory
exports.ServerConnector = EyesSDK.ServerConnector
exports.SessionEventHandler = EyesSDK.SessionEventHandler
exports.TestResultsFormatter = EyesSDK.TestResultsFormatter
exports.Triggers = EyesSDK.Triggers

var EyesUtils = require('eyes.utils')
exports.ArgumentGuard = EyesUtils.ArgumentGuard
exports.GeneralUtils = EyesUtils.GeneralUtils
exports.GeometryUtils = EyesUtils.GeometryUtils
exports.ImageDeltaCompressor = EyesUtils.ImageDeltaCompressor
exports.ImageUtils = EyesUtils.ImageUtils
exports.PromiseFactory = EyesUtils.PromiseFactory
exports.PropertyHandler = EyesUtils.PropertyHandler
exports.SimplePropertyHandler = EyesUtils.SimplePropertyHandler
exports.ReadOnlyPropertyHandler = EyesUtils.ReadOnlyPropertyHandler
exports.StreamUtils = EyesUtils.StreamUtils