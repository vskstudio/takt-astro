import { describe, it, expect, vi } from 'vitest'
import takt from '../src/index'
import { takt as namedTakt } from '../src/integration'
import { resolveOptions } from '../src/options'
import { buildRuntime } from '../src/runtime'

function setup(options?: Parameters<typeof takt>[0]) {
  const integration = takt(options)
  const injectScript = vi.fn()
  integration.hooks['astro:config:setup']?.({ injectScript } as never)
  return { integration, injectScript, content: injectScript.mock.calls[0]?.[1] as string }
}

describe('takt integration object', () => {
  it('is a default export and a named export pointing to the same factory', () => {
    expect(takt).toBe(namedTakt)
  })

  it('has the conventional integration name', () => {
    expect(takt().name).toBe('@vskstudio/takt-astro')
  })

  it('registers the astro:config:setup hook', () => {
    const hooks = takt().hooks
    expect(typeof hooks['astro:config:setup']).toBe('function')
  })

  it('does not register unrelated hooks', () => {
    expect(Object.keys(takt().hooks)).toEqual(['astro:config:setup'])
  })

  it('calls injectScript once on the page stage', () => {
    const { injectScript } = setup()
    expect(injectScript).toHaveBeenCalledTimes(1)
    expect(injectScript.mock.calls[0][0]).toBe('page')
  })
})

describe('injected runtime content', () => {
  it('imports init from core', () => {
    const { content } = setup()
    expect(content).toContain("from '@vskstudio/takt-core'")
    expect(content).toContain('init')
  })

  it('embeds the user domain and endpoint', () => {
    const { content } = setup({ domain: 'example.com', endpoint: '/collect' })
    expect(content).toContain('"domain":"example.com"')
    expect(content).toContain('"endpoint":"/collect"')
  })

  it('uses exactly one pageview source: core SPA, not an astro:page-load listener', () => {
    const { content } = setup()
    // Core's enableSpa (via init with auto:true) patches history.pushState, which
    // Astro's ClientRouter uses — so a page-load listener would double-count.
    expect(content).toContain('init(o)')
    expect(content).not.toContain('astro:page-load')
    expect(content).not.toContain('pageview(')
  })

  it('guards against SSR/prerender (no window)', () => {
    const { content } = setup()
    expect(content).toContain("typeof window !== 'undefined'")
  })

  it('guards against double-init across paths', () => {
    const { content } = setup()
    expect(content).toContain('window.__takt')
  })

  it('relies on init() for the initial pageview without firing another', () => {
    const { content } = setup()
    // init() (auto:true) fires the initial pageview; the runtime must not call
    // pageview() itself, which would double-count the first load.
    expect(content).toContain('init(o)')
    expect(content).not.toContain('pageview(')
  })
})

describe('option resolution & defaults', () => {
  it('applies documented defaults', () => {
    expect(resolveOptions()).toMatchObject({
      outbound: false,
      files: false,
      respectDnt: true,
      excludeLocalhost: true,
      auto: true,
    })
  })

  it('maps spa:false to core auto:false', () => {
    expect(resolveOptions({ spa: false }).auto).toBe(false)
  })

  it('respects explicit privacy overrides', () => {
    const r = resolveOptions({ respectDnt: false, excludeLocalhost: false })
    expect(r.respectDnt).toBe(false)
    expect(r.excludeLocalhost).toBe(false)
  })

  it('forwards outbound and files toggles', () => {
    const r = resolveOptions({ outbound: true, files: true })
    expect(r.outbound).toBe(true)
    expect(r.files).toBe(true)
  })

  it('serializes spa default as auto:true in the runtime', () => {
    const { content } = setup()
    expect(content).toContain('"auto":true')
  })
})

describe('injection safety', () => {
  it('escapes a domain that tries to break out of the string literal', () => {
    const evil = '";evil()//'
    const content = buildRuntime(resolveOptions({ domain: evil }))
    // The quote is escaped, so the value stays trapped inside the JSON string
    // literal and cannot terminate it to inject a bare statement.
    expect(content).toContain('\\";evil()//')
    expect(content).toContain(JSON.stringify(evil))
    // Sanity: the serialized options round-trip back to the original value.
    const o = JSON.parse(content.match(/const o = (\{.*\});/)![1])
    expect(o.domain).toBe(evil)
  })

  it('escapes a </script> breakout in the domain (no literal closing tag emitted)', () => {
    const evil = '</script><script>alert(1)</script>'
    const content = buildRuntime(resolveOptions({ domain: evil }))
    // `<` is escaped, so no literal `</script>` (or other tag) reaches the HTML parser.
    expect(content).toContain('\\u003c')
    expect(content).not.toContain('</script>')
    expect(content).not.toContain('<script>')
    // The value still round-trips to the original at runtime (JSON.parse decodes \uXXXX).
    const o = JSON.parse(content.match(/const o = (\{.*\});/)![1])
    expect(o.domain).toBe(evil)
  })

  it('produces runtime parseable as a module body (balanced braces)', () => {
    const { content } = setup({ domain: 'a.com' })
    const opens = (content.match(/\{/g) || []).length
    const closes = (content.match(/\}/g) || []).length
    expect(opens).toBe(closes)
  })
})
