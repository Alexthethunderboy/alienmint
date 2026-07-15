export const mockCollection = {
  name: "AlienMint Genesis", symbol: "ALIEN", supply: 3427, maxSupply: 10000,
  mintPrice: 0.05, maxPerTransaction: 5,
  description: "A study in clear glass, engineered light, and digital permanence. Six preview works demonstrate the visual system behind a larger unique-art collection.",
  artworks: [
    ["/nft/signal-01.png", "Aperture", "Emerald / Glass"], ["/nft/signal-02.png", "Convergence", "Cyan / Prism"],
    ["/nft/signal-03.png", "Vector", "Silver / Crystal"], ["/nft/signal-04.png", "Continuum", "Emerald / Loop"],
    ["/nft/signal-05.png", "Genesis", "Cyan / Core"], ["/nft/signal-06.png", "Monolith", "Obsidian / Light"],
  ] as const,
};
