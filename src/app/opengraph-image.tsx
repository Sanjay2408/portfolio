import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'
import { headlineSentence } from '@/content/risk-atlas'

export const alt = `${profile.name}: ${profile.headline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Generated at build time; the same numbers as the page. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#fbfaf7',
        color: '#17160f',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: -3 }}>{profile.name}</div>
        <div style={{ fontSize: 36, color: '#57544b', marginTop: 16 }}>{profile.headline}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '3px solid #17160f' }}>
        <div style={{ fontSize: 22, color: '#c2410c', marginTop: 24, letterSpacing: 2 }}>
          FLAGSHIP · RISK//ATLAS
        </div>
        <div style={{ fontSize: 30, marginTop: 12, lineHeight: 1.3 }}>{headlineSentence}</div>
      </div>
    </div>,
    size,
  )
}
