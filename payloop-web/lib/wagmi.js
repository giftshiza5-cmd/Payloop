import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy, localhost } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [polygonAmoy, localhost, polygon],
  connectors: [injected()],
  ssr: true, // Enable Server-Side Rendering support for Next.js
  transports: {
    [polygonAmoy.id]: http(),
    [localhost.id]: http(),
    [polygon.id]: http(),
  },
});
