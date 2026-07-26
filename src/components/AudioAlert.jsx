import { useEffect, useRef } from 'react'

function reverbImpulse(ctx, duration = 2, decay = 2.5) {
  const length = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / ctx.sampleRate
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t / duration, decay)
    }
  }
  return buffer
}

function playDeathknell(ctx, params) {
  let nextTime = ctx.currentTime + 0.1
  const { baseGain, oscType, freq, overtoneFreq, overtoneGain, attack, release, toneDur, cycle, reverbMix, reverbTime, flutterFreq, flutterDepth } = params
  const schedule = () => {
    if (nextTime > ctx.currentTime + 10) return
    const t = nextTime
    const osc = ctx.createOscillator()
    osc.type = oscType
    osc.frequency.setValueAtTime(freq, t)

    const flOsc = ctx.createOscillator()
    flOsc.type = 'sine'
    flOsc.frequency.value = flutterFreq
    const flGain = ctx.createGain()
    flGain.gain.value = flutterDepth
    flOsc.connect(flGain)
    flGain.connect(osc.frequency)
    flOsc.start(t)
    flOsc.stop(t + toneDur + 0.1)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(baseGain, t + attack)
    gain.gain.setValueAtTime(baseGain, t + toneDur - release)
    gain.gain.linearRampToValueAtTime(0, t + toneDur)

    const over = ctx.createOscillator()
    over.type = 'sine'
    over.frequency.setValueAtTime(overtoneFreq, t)
    const overGain = ctx.createGain()
    overGain.gain.setValueAtTime(0, t)
    overGain.gain.linearRampToValueAtTime(overtoneGain, t + attack)
    overGain.gain.setValueAtTime(overtoneGain, t + toneDur - release)
    overGain.gain.linearRampToValueAtTime(0, t + toneDur)
    over.connect(overGain)
    overGain.connect(gain)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(250, t)
    filter.Q.value = 1.5
    osc.connect(filter)
    filter.connect(gain)

    const convolver = ctx.createConvolver()
    convolver.buffer = reverbImpulse(ctx, reverbTime, 2.5)
    const wet = ctx.createGain()
    wet.gain.value = reverbMix
    gain.connect(convolver)
    convolver.connect(wet)
    wet.connect(ctx.destination)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + toneDur + 0.1)
    over.start(t)
    over.stop(t + toneDur + 0.1)

    nextTime += cycle
    setTimeout(schedule, 2000)
  }
  schedule()
  return () => { nextTime = Infinity }
}

function playAirraid(ctx, params) {
  let nextTime = ctx.currentTime + 0.1
  const { baseGain, oscType, sweepLow, sweepHigh, overtoneMult, overtoneGain, subFreq, subGain, cycle, rise, hold: holdTime, fall, reverbMix, reverbTime } = params
  const schedule = () => {
    if (nextTime > ctx.currentTime + 10) return
    const t = nextTime
    const osc = ctx.createOscillator()
    osc.type = oscType
    osc.frequency.setValueAtTime(sweepLow, t)
    osc.frequency.linearRampToValueAtTime(sweepHigh, t + rise)
    osc.frequency.setValueAtTime(sweepHigh, t + rise + holdTime)
    osc.frequency.linearRampToValueAtTime(sweepLow, t + rise + holdTime + fall)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(baseGain, t + rise * 0.7)
    gain.gain.setValueAtTime(baseGain, t + rise + holdTime)
    gain.gain.linearRampToValueAtTime(0, t + rise + holdTime + fall + 0.2)

    const over = ctx.createOscillator()
    over.type = 'square'
    over.frequency.setValueAtTime(sweepLow * overtoneMult, t)
    over.frequency.linearRampToValueAtTime(sweepHigh * overtoneMult, t + rise)
    over.frequency.setValueAtTime(sweepHigh * overtoneMult, t + rise + holdTime)
    over.frequency.linearRampToValueAtTime(sweepLow * overtoneMult, t + rise + holdTime + fall)
    const overGain = ctx.createGain()
    overGain.gain.setValueAtTime(0, t)
    overGain.gain.linearRampToValueAtTime(overtoneGain, t + rise * 0.8)
    overGain.gain.setValueAtTime(overtoneGain, t + rise + holdTime)
    overGain.gain.linearRampToValueAtTime(0, t + rise + holdTime + fall)
    over.connect(overGain)
    overGain.connect(gain)

    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.value = subFreq
    const subGain2 = ctx.createGain()
    subGain2.gain.setValueAtTime(0, t)
    subGain2.gain.linearRampToValueAtTime(subGain, t + rise * 0.5)
    subGain2.gain.setValueAtTime(subGain, t + rise + holdTime)
    subGain2.gain.linearRampToValueAtTime(0, t + rise + holdTime + fall)
    sub.connect(subGain2)
    subGain2.connect(gain)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, t)
    filter.frequency.linearRampToValueAtTime(1200, t + rise)
    filter.frequency.setValueAtTime(1200, t + rise + holdTime)
    filter.frequency.linearRampToValueAtTime(400, t + rise + holdTime + fall)
    filter.Q.value = 2
    osc.connect(filter)
    filter.connect(gain)

    const convolver = ctx.createConvolver()
    convolver.buffer = reverbImpulse(ctx, reverbTime, 3)
    const wet = ctx.createGain()
    wet.gain.value = reverbMix
    gain.connect(convolver)
    convolver.connect(wet)
    wet.connect(ctx.destination)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + rise + holdTime + fall + 0.2)
    over.start(t)
    over.stop(t + rise + holdTime + fall + 0.1)
    sub.start(t)
    sub.stop(t + rise + holdTime + fall)

    nextTime += cycle
    setTimeout(schedule, 3000)
  }
  schedule()
  return () => { nextTime = Infinity }
}

function playDissonance(ctx, params) {
  let nextTime = ctx.currentTime + 0.1
  const { baseGain, freq1, freq2, freq3, subFreq, subGain, attack, release, toneDur, cycle, reverbMix, reverbTime, pulseVariation } = params
  const freqs = [freq1, freq2, freq3]
  const weights = [baseGain * 0.55, baseGain * 0.4, baseGain * 0.3]
  const schedule = () => {
    if (nextTime > ctx.currentTime + 10) return
    const t = nextTime
    const oscillators = freqs.map((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = i === 0 ? 'sawtooth' : 'square'
      osc.frequency.setValueAtTime(f, t)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(weights[i], t + attack)
      g.gain.setValueAtTime(weights[i], t + toneDur - release)
      g.gain.linearRampToValueAtTime(0, t + toneDur)
      osc.connect(g)
      return { osc, gain: g }
    })

    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.value = subFreq
    const subG = ctx.createGain()
    subG.gain.setValueAtTime(0, t)
    subG.gain.linearRampToValueAtTime(subGain, t + attack * 0.5)
    subG.gain.setValueAtTime(subGain, t + toneDur - release)
    subG.gain.linearRampToValueAtTime(0, t + toneDur)
    sub.connect(subG)

    const mix = ctx.createGain()
    mix.gain.value = 1
    oscillators.forEach(o => o.gain.connect(mix))

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(150, t)
    filter.frequency.linearRampToValueAtTime(250, t + toneDur * 0.5)
    filter.frequency.linearRampToValueAtTime(150, t + toneDur)
    filter.Q.value = 4
    mix.connect(filter)

    const convolver = ctx.createConvolver()
    convolver.buffer = reverbImpulse(ctx, reverbTime, 3.5)
    const wet = ctx.createGain()
    wet.gain.value = reverbMix
    filter.connect(convolver)
    convolver.connect(wet)
    wet.connect(ctx.destination)
    filter.connect(ctx.destination)
    subG.connect(ctx.destination)

    oscillators.forEach(o => {
      o.osc.start(t)
      o.osc.stop(t + toneDur + 0.1)
    })
    sub.start(t)
    sub.stop(t + toneDur)

    const jitter = (Math.random() - 0.5) * pulseVariation
    nextTime += cycle + jitter
    setTimeout(schedule, 2500)
  }
  schedule()
  return () => { nextTime = Infinity }
}

export default function AudioAlert({ threatLevel, muted, theme, booting }) {
  useEffect(() => {
    if (booting) return
    if (!threatLevel || threatLevel.level < 3) return
    if (muted) return

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()

    const themeParams = {
      terminal: {
        baseGain: 0.22, oscType: 'sine', freq: 55, overtoneFreq: 110, overtoneGain: 0.06,
        cycle: 3.2, toneDur: 1.8, attack: 0.6, release: 1.2, reverbMix: 0.45, reverbTime: 2,
        flutterFreq: 6, flutterDepth: 2,
      },
      hud: {
        baseGain: 0.22, oscType: 'sawtooth', sweepLow: 160, sweepHigh: 340, overtoneMult: 1.5,
        overtoneGain: 0.08, subFreq: 40, subGain: 0.12, cycle: 6, rise: 2.5, hold: 0.5, fall: 2,
        reverbMix: 0.55, reverbTime: 2.5,
      },
      cyberpunk: {
        baseGain: 0.22, freq1: 142, freq2: 178, freq3: 215, subFreq: 35, subGain: 0.1,
        cycle: 4.5, toneDur: 2.2, attack: 1, release: 1.5, reverbMix: 0.6, reverbTime: 3,
        pulseVariation: 0.4,
      },
    }

    const p = themeParams[theme] || themeParams.terminal
    const playFn = theme === 'hud' ? playAirraid : theme === 'cyberpunk' ? playDissonance : playDeathknell
    const cleanupFn = playFn(ctx, p)

    return () => {
      ctx.close()
      cleanupFn()
    }
  }, [threatLevel, muted, theme, booting])

  return null
}
