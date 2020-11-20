module.exports = {
	Name: "necrodancer",
	Aliases: null,
	Author: "supinic",
	Cooldown: 10000,
	Description: "Download, beatmap and assign any (supported by youtube-dl) song link into Crypt of the Necrodancer directly. Use (link) and then (zone) - for more info, check extended help.",
	Flags: ["mention","pipe","whitelist"],
	Whitelist_Response: null,
	Static_Data: (() => {
		this.data.cooldowns = {};
		return {
			zones: [
				"lobby",
				"1-1", "1-2", "1-3",
				"2-1", "2-2", "2-3",
				"3-1", "3-2", "3-3",
				"4-1", "4-2", "4-3",
				"5-1", "5-2", "5-3",
				"conga", "chess", "bass", "metal", "mole"
			],
			zoneCooldown: 15000
		};
	}),
	Code: (async function necrodancer (context, link, zone) {
		if (context.channel?.ID !== 38) {
			return {
				success: false,
				reply: "This shouldn't happen, but the command cannot be used here!"
			};
		}

		const { zones } = this.staticData;
		if (!link) {
			return {
				reply: "Check the basic guidelines for Necrodancer songs here: https://pastebin.com/K4n151xz TL;DR - not too fast, not too slow, not too short." ,
				cooldown: 2500
			};
		}
		else if (!zone) {
			return {
				success: false,
				reply: "No game zone provided! Use one of: " + zones.join(", "),
				cooldown: 2500
			};
		}

		zone = zone.toLowerCase();
		if (!zones.includes(zone)) {
			return {
				success: false,
				reply: "Invalid zone provided! Use one of: " + zones.join(", ")
			};
		}

		this.data.cooldowns[zone] = this.data.cooldowns[zone] ?? 0;

		const now = sb.Date.now();
		if (this.data.cooldowns[zone] >= now) {
			const delta = sb.Utils.timeDelta(this.data.cooldowns[zone]);
			return {
				reply: `The cooldown for that zone has not passed yet. Try again in ${delta}.`
			};
		}
		this.data.cooldowns[zone] = now + this.staticData.zoneCooldown;
		// be sure that the HTTP request is done after the cooldown to avoid a race condition

		const data = JSON.stringify({ link, zone });
		const url = `${sb.Config.get("LOCAL_IP")}:${sb.Config.get("LOCAL_PLAY_SOUNDS_PORT")}?necrodancer=${data}`;
		
		await context.channel.send("Download + beat mapping + saving started! Please wait...");
		await sb.Got(url);
	
		return {
			reply: "Downloaded + beat mapped successfully! AlienPls"
		};
	}),
	Dynamic_Description: ((prefix, values) => {
		const { zones } = values.getStaticData();
		return [
			"Downloads, beatmaps and inserts a song from a link into the Crypt of the Necrodancer game.",
			"",

			`<code>${prefix}necrodancer (link) (zone)</code>`,
			"From a given link, extracts the song, beatmaps it automatically and inserts it as the song to play in game in the provided zone",
			"",

			"Zone list:",
			"<ul>" + zones.map(i => `<li><code>${i}</code></li>`).join("") + "</ul>"
		];
	})
};