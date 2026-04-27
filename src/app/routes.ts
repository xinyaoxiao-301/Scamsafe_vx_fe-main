// All route values include the hash prefix because the app is deployed as a
// static frontend. Keeping route strings centralized prevents links, navigation,
// and hash parsing from drifting apart.
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
  { route: appRoutes.detection, label: 'Scam Detection' },
  { route: appRoutes.simulation, label: 'Scam Simulation' },
  { route: appRoutes.studyCenter, label: 'Study Center' },
  { route: appRoutes.aboutUs, label: 'Knowledge Hub' },
  { route: appRoutes.support, label: 'Support' },
] as const

export function getRouteFromHash(hash: string): AppRoute {
  // Unknown hashes intentionally fall back to Home instead of rendering a 404,
  // because this product has no server router and should recover gracefully from
  // stale bookmarks or copied links.
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
