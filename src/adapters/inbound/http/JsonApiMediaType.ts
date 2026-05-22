/**
 * The JSON:API media type. Every response this HTTP adapter emits — success
 * envelopes and error envelopes alike — carries it, so it is defined once
 * here rather than re-typed as a literal at each call site.
 */
export const JSON_API_CONTENT_TYPE = 'application/vnd.api+json';
