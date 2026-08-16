# TabEnhancer for Paper
https://pixc1.github.io/
**TabEnhancer** improves the player TAB list with a configurable Header, Footer, game-mode prefixes, and optional Ping display. The included browser configurator generates a valid `config.yml` and can package it with the plugin JAR.

## Compatibility

The plugin JAR was compiled for **Java 8 bytecode** using the PaperSpigot 1.8.8 API and was runtime-tested on Paper 1.21.11. Its intended Paper compatibility range is **1.8.8 through 1.21.x**. The Java version required by your server remains dependent on your chosen Minecraft version.

## Install

1. Download `releases/tab-enhancer-1.1.0.jar` or use the configurator to download a custom ZIP package.
2. Copy the JAR to your server's `plugins/` directory and start the Paper server once.
3. Replace `plugins/TabEnhancer/config.yml` with your custom configuration.
4. Run `/tabreload` in-game or restart the server after editing the configuration.

## Browser configurator

The source for the bilingual Arabic/English configurator is in `configurator/`. It exposes only settings that the plugin reads: Header, Footer, supported placeholders, header/footer visibility, mode prefixes, Ping visibility, and the update interval.

The ready-to-serve GitHub Pages build is in `docs/`. To host it through GitHub Pages, enable **Settings → Pages**, select **Deploy from a branch**, then choose the `main` branch and `/docs` folder. This manual step keeps site publishing under the repository owner's control.

## Repository layout

| Directory | Contents |
|---|---|
| `plugin/` | Maven source code and the default plugin configuration |
| `releases/` | Built TabEnhancer JAR ready for server installation |
| `configurator/` | React/Vite source for the configuration studio |
| `docs/` | Static GitHub Pages-ready build of the configuration studio |

## Supported placeholders

| Placeholder | Displayed value |
|---|---|
| `%player%` | The player name |
| `%online%` | Current online-player count |
| `%max%` | Maximum player count |
| `%gamemode%` | The configured game-mode label |
| `%ping%` | The player's Ping in milliseconds |

## License

This project is provided for the repository owner's Minecraft server use. Add a formal license before redistributing the project publicly.
