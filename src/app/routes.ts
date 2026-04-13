export const appRoutes = {
  home: '#/',
  detection: '#/scam-detection',
  simulation: '#/scam-simulation',
  studyCenter: '#/study-center',
  support: '#/post-scam-support',
  aboutUs: '#/about-us',
} as const

export type AppRoute = (typeof appRoutes)[keyof typeof appRoutes]

export const primaryNavItems = [
  { route: appRoutes.home, label: 'Home' },
  { route: appRoutes.detection, label: 'Scam Detection' },
  { route: appRoutes.simulation, label: 'Scam Simulation' },
  { route: appRoutes.studyCenter, label: 'Study Center' },
  { route: appRoutes.support, label: 'Post-Scam Support' },
  { route: appRoutes.aboutUs, label: 'About Us' },
] as const

export function getRouteFromHash(hash: string): AppRoute {
  switch (hash) {
    case appRoutes.detection:
      return appRoutes.detection
    case appRoutes.simulation:
      return appRoutes.simulation
    case appRoutes.studyCenter:
      return appRoutes.studyCenter
    case appRoutes.support:
      return appRoutes.support
    case appRoutes.aboutUs:
      return appRoutes.aboutUs
    case appRoutes.home:
    case '':
      return appRoutes.home
    default:
      return appRoutes.home
  }
}
