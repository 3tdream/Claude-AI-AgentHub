import { introModule } from './intro-module'
import { uxResearchModule } from './ux-research-module'
import { visualDesignModule } from './visual-design-module'
import { prototypingModule } from './prototyping-module'

export interface ModuleInfo {
  id: string
  title: string
  description: string
  icon: string
  lessons: { id: string; title: string; subtitle: string; duration: string; sections: any[]; quiz: any[] }[]
}

export const allModules: Record<string, ModuleInfo> = {
  intro: introModule,
  visual: visualDesignModule,
  research: uxResearchModule,
  prototyping: prototypingModule,
}
