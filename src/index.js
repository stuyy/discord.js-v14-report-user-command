import { config } from 'dotenv';
config();
import { Client, GatewayIntentBits, Routes, TextInputStyle } from 'discord.js';
import { REST } from '@discordjs/rest';
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
} from '@discordjs/builders';

const { BOT_TOKEN, CLIENT_ID } = process.env;
const GUILD_ID = 'Your Guild Id Here';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

client.on('ready', () => console.log(`${client.user.tag} has logged in`));

const commands = [
  {
    name: 'Report',
    type: 2,
  },
];

client.on('interactionCreate', async (interaction) => {
  if (interaction.isUserContextMenuCommand()) {
    if (interaction.commandName === 'Report') {
      const modal = new ModalBuilder()
        .setCustomId('reportUserModal')
        .setTitle(`Report User: ${interaction.targetUser.tag}`)
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setCustomId('reportMessage')
              .setLabel('Report Message')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
              .setMinLength(10)
              .setMaxLength(500)
          )
        );

      await interaction.showModal(modal);
      const modalSubmitInteraction = await interaction.awaitModalSubmit({
        filter: (i) => {
          console.log('Await Modal Submit');
          console.log(i.fields);
          return true;
        },
        time: 120000, // 120 seconds = 120000 milliseconds, this is how long the user has to submit the modal before it errors. Use try / catch or .then().catch() to handle this.
      });

      modalSubmitInteraction.reply({
        content: `Thank you for reporting ${
          interaction.targetMember
        }. Reason: ${modalSubmitInteraction.fields.getTextInputValue(
          'reportMessage'
        )}`,
        ephemeral: true,
      });
    }
  }
});

async function main() {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    client.login(BOT_TOKEN);
  } catch (err) {
    console.log(err);
  }
}

main();
