import express from 'express';
import cookieParser from 'cookie-parser';
import { SoundsService } from 'botman-sounds';
import { PrefsService, FavoritesService, TagsService } from 'botman-users';
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger, { requestLogger } from '../logger';
import DiscordAuth from './middlewares/discord-auth';
import soundsRouter from './routes/sounds';
import favoritesRouter from './routes/favorites';
import tagsRouter from './routes/tags';
import prefsRouter from './routes/prefs';
import queueRouter from './routes/queue';
import { WebServerEnvironment } from '../environment';
import Bot from '../bot/bot';

export default class WebServer {
  private readonly soundsService: SoundsService;
  private readonly prefsService: PrefsService;
  private readonly favoritesService: FavoritesService;
  private readonly tagsService: TagsService;

  private readonly authURL: string;

  private readonly bot: Bot;

  constructor(private readonly environment: WebServerEnvironment, bot: Bot) {
    this.bot = bot;

    this.soundsService = new SoundsService(environment.dbConnectionString, environment.blobStorageConnectionString);
    this.prefsService = new PrefsService(environment.dbConnectionString);
    this.favoritesService = new FavoritesService(environment.dbConnectionString);
    this.tagsService = new TagsService(environment.dbConnectionString);

    this.authURL = `https://discord.com/api/oauth2/authorize?client_id=${ environment.clientID }&redirect_uri=${ encodeURI(environment.appURL) }&response_type=code&scope=identify&prompt=none`;
  }

  start() {
    const app = express();
    app.use(requestLogger);
    const serveStatic = express.static('src/web/public', { extensions: ['html'] });

    app.use(cookieParser());
    app.use(express.json());

    app.use(async (req, res, next) => {
      try { next(); } catch (error: any) { res.sendStatus(500); }
    });

    app.get('/health', (req, res) => { res.sendStatus(204); });

    app.post('/logout', (req, res) => {
      res.clearCookie('accesstoken');
      res.clearCookie('refreshtoken');
      res.sendStatus(201);
      res.end();
    });

    app.use(DiscordAuth(this.environment, this.prefsService, this.authURL));
    app.use(async (req, res, next) => {
      const sortPrefs = await this.prefsService.getSortPrefs(String(req.cookies.userid));
      res.cookie('sortpref', sortPrefs.sortOrder);
      res.cookie('groupspref', sortPrefs.tagGroups);
      next();
    });

    app.use('/api/sounds', soundsRouter(this.soundsService, this.favoritesService, this.tagsService, this.prefsService, this.environment.soundsBaseUrl));
    app.use('/api/prefs', prefsRouter(this.prefsService));
    app.use('/api/favorites', favoritesRouter(this.favoritesService));
    app.use('/api/tags', tagsRouter(this.tagsService));
    app.use('/api/queue', queueRouter(this.bot.playSound, this.bot.skipSounds));

    if (this.environment.environment === 'production') app.use(serveStatic);
    else app.use('/', createProxyMiddleware({ target: 'http://frontend:3000', changeOrigin: true }));

    return app.listen(this.environment.port, () => {
      logger.info(`web server listening on port ${ this.environment.port }`);
    });
  }
}
