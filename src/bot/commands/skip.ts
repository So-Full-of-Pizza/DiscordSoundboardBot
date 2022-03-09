import { CommandInteraction } from 'discord.js';
import BotContext from '../bot-context';
import Command from './command';

const skipCommandOption = 'count';
export class SkipCommand extends Command {
  constructor() {
    super('skip', 'Skip currently playing sound(s)');
    this.commandData.options = [{
      name: skipCommandOption,
      type: 'STRING',
      required: false,
      description: 'Enter amount to skip (including currently playing) or "all" to clear the queue entirely.',
    }];
  }

  execute(interaction: CommandInteraction, context: BotContext): Promise<any> {
    const skipOption = interaction.options.getString(skipCommandOption, false);
    const count = Number(skipOption);
    if (context.botAudioPlayer.state === 'idle' && context.soundQueue.length === 0)
      // eslint-disable-next-line no-useless-escape
      return interaction.reply({ content: 'No sounds currently playing or in queue! Why not try "/sound limmy are you deaf" ? \:ear_with_hearing_aid: \:smile:', ephemeral: true });
    if (!skipOption) {
      context.botAudioPlayer.stop();
      return interaction.reply({ content: 'Current sound skipped', ephemeral: false });
    }
    if (skipOption === 'all') {
      context.botAudioPlayer.stop();
      context.soundQueue.clear();
      return interaction.reply({ content: 'Skipped all sounds. Queue is now empty.', ephemeral: false });
    }
    if (Number.isInteger(count)) {
      const reply = (count > context.soundQueue.length) ? 'All sounds skipped (count option was >= number of current sounds.)' : `Skipped ${ skipOption } sound(s).`;
      context.botAudioPlayer.stop();
      context.soundQueue.splice(0, count - 1);
      return interaction.reply({ content: reply, ephemeral: false });
    }
    return interaction.reply({ content: 'Invalid value for count entered. Try a whole number or "all" without quotes.', ephemeral: true });
  }
}
export default new SkipCommand();
