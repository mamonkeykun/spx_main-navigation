const styles: Record<string, string> = new Proxy({}, { get: (_t, prop) => String(prop) });

export default styles;
