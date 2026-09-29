import { About } from '@/components/sections/about'
import { Design } from '@/components/sections/design'
import { Flagship } from '@/components/sections/flagship'
import { Hero } from '@/components/sections/hero'
import { Skills } from '@/components/sections/skills'
import { Wins } from '@/components/sections/wins'
import { Work } from '@/components/sections/work'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Flagship />
      <Work />
      <Skills />
      <Wins />
      <Design />
    </>
  )
}
