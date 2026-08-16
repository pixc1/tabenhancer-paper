package com.example.tabenhancer;

import net.md_5.bungee.api.chat.TextComponent;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.GameMode;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerGameModeChangeEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.lang.reflect.Method;
import java.util.List;

public final class TabEnhancerPlugin extends JavaPlugin implements Listener, CommandExecutor {

    private int updateTaskId = -1;

    @Override
    public void onEnable() {
        saveDefaultConfig();

        if (getCommand("tabreload") != null) {
            getCommand("tabreload").setExecutor(this);
        }

        getServer().getPluginManager().registerEvents(this, this);
        startUpdateTask();
        updateAllPlayers();
        getLogger().info("TabEnhancer enabled for Paper 1.8.8 and newer.");
    }

    @Override
    public void onDisable() {
        if (updateTaskId != -1) {
            Bukkit.getScheduler().cancelTask(updateTaskId);
        }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!command.getName().equalsIgnoreCase("tabreload")) {
            return false;
        }

        reloadConfig();
        startUpdateTask();
        updateAllPlayers();
        sender.sendMessage(colorize("&aتم إعادة تحميل إعدادات TAB بنجاح."));
        return true;
    }

    private void startUpdateTask() {
        if (updateTaskId != -1) {
            Bukkit.getScheduler().cancelTask(updateTaskId);
        }

        long interval = Math.max(1L, getConfig().getLong("settings.update-interval-ticks", 20L));
        updateTaskId = Bukkit.getScheduler().runTaskTimer(this, new Runnable() {
            @Override
            public void run() {
                updateAllPlayers();
            }
        }, 0L, interval).getTaskId();
    }

    private void updateAllPlayers() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            updatePlayer(player);
        }
    }

    private void updatePlayer(Player viewer) {
        boolean showHeaderFooter = getConfig().getBoolean("settings.show-header-footer", true);
        if (showHeaderFooter) {
            String header = formatLines(getConfig().getStringList("header"), viewer);
            String footer = formatLines(getConfig().getStringList("footer"), viewer);
            setHeaderFooter(viewer, header, footer);
        } else {
            setHeaderFooter(viewer, "", "");
        }

        if (!getConfig().getBoolean("settings.show-status-prefix", true)) {
            viewer.setPlayerListName(colorize(viewer.getName()));
            return;
        }

        String key = gameModeKey(viewer.getGameMode());
        String prefix = getConfig().getString("prefixes." + key,
                getConfig().getString("prefixes.unknown", "&f"));
        String name = colorize(prefix + viewer.getName());

        if (getConfig().getBoolean("settings.show-ping", false)) {
            String ping = getPing(viewer);
            if (ping != null) {
                name = name + colorize(" &8| &7Ping: &f" + ping + "ms");
            }
        }

        viewer.setPlayerListName(name);
    }

    private void setHeaderFooter(Player player, String header, String footer) {
        player.setPlayerListHeaderFooter(
                TextComponent.fromLegacyText(header),
                TextComponent.fromLegacyText(footer)
        );
    }

    private String formatLines(List<String> lines, Player viewer) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < lines.size(); i++) {
            if (i > 0) {
                result.append('\n');
            }
            result.append(replacePlaceholders(lines.get(i), viewer));
        }
        return colorize(result.toString());
    }

    private String replacePlaceholders(String text, Player viewer) {
        String modeLabel = getConfig().getString("gamemode-labels." + gameModeKey(viewer.getGameMode()), "&7Unknown");
        String ping = getPing(viewer);
        if (ping == null) {
            ping = "-";
        }

        return text
                .replace("%player%", viewer.getName())
                .replace("%online%", String.valueOf(Bukkit.getOnlinePlayers().size()))
                .replace("%max%", String.valueOf(Bukkit.getMaxPlayers()))
                .replace("%gamemode%", modeLabel)
                .replace("%ping%", ping);
    }

    private String gameModeKey(GameMode gameMode) {
        if (gameMode == GameMode.SURVIVAL) {
            return "survival";
        }
        if (gameMode == GameMode.CREATIVE) {
            return "creative";
        }
        if (gameMode == GameMode.ADVENTURE) {
            return "adventure";
        }
        if (gameMode == GameMode.SPECTATOR) {
            return "spectator";
        }
        return "unknown";
    }

    private String getPing(Player player) {
        try {
            Method method = player.getClass().getMethod("getPing");
            Object result = method.invoke(player);
            return String.valueOf(result);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String colorize(String text) {
        return ChatColor.translateAlternateColorCodes('&', text);
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        scheduleUpdate();
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        scheduleUpdate();
    }

    @EventHandler
    public void onGameModeChange(PlayerGameModeChangeEvent event) {
        scheduleUpdate();
    }

    @EventHandler
    public void onWorldChange(PlayerChangedWorldEvent event) {
        scheduleUpdate();
    }

    private void scheduleUpdate() {
        Bukkit.getScheduler().runTask(this, new Runnable() {
            @Override
            public void run() {
                updateAllPlayers();
            }
        });
    }
}
