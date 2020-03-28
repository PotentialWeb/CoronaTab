/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.svg' {
  const resource: React.StatelessComponent<React.SVGAttributes<SVGElement>>
  export default resource
}

declare module '*.json' {
  const resource: any
  export = resource
}
