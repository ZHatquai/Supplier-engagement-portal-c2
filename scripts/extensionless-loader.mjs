// Vite resolves extensionless relative imports; plain Node does not. This loader
// lets the verification scripts import src/ modules exactly as the app does.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context)
  } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      return next(`${specifier}.js`, context)
    }
    throw error
  }
}
