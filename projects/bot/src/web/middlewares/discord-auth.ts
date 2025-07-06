import axios from 'axios';
import { RequestHandler } from 'express';
import { PrefsService } from 'botman-users';
import logger from '../../logger';
import { WebServerEnvironment } from '../../environment';

declare global {
  namespace Express {
    interface Request {
      userRole: string;
    }
  }
}

export default function discordAuth(environment: WebServerEnvironment, prefsService: PrefsService, authUrl: string) {
  const middleware: RequestHandler = async (req, res, next) => {
    let userReqToken = req.cookies.accesstoken ?? null;

    if (req.query.code || (!req.cookies.accesstoken && req.cookies.refreshtoken)) {
      const params = new URLSearchParams({
        client_id: environment.clientID,
        client_secret: environment.clientSecret,
        grant_type: req.query.code ? 'authorization_code' : 'refresh_token',
      });
      if (req.query.code) {
        params.append('code', String(req.query.code));
        params.append('redirect_uri', environment.appURL);
      } else { params.append('refresh_token', req.cookies.refreshtoken); }
      try {
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params, { headers: { 'Accept-encoding': 'application/json' } });
        res.cookie('accesstoken', tokenRes.data.access_token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
        res.cookie('refreshtoken', tokenRes.data.refresh_token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 48 });
        if (req.query.code) {
          res.redirect('/');
          return;
        }
        userReqToken = tokenRes.data.access_token;
        logger.info('token response from discord');
      } catch (error) {
        logger.info(error);
      }
    }

    if (userReqToken)
      try {
        const userRes = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${ userReqToken }`, 'Accept-encoding': 'application/json' } });
        res.cookie('username', userRes.data.username);
        res.cookie('userid', userRes.data.id);
        res.cookie('avatar', userRes.data.avatar);
        const userRole = await prefsService.getUserRole(userRes.data.id);
        req.userRole = userRole!;
        res.cookie('role', req.userRole);
        const userTheme = await prefsService.getUserTheme(userRes.data.id);
        res.cookie('theme', userTheme?.theme);
        res.cookie('useSeasonal', userTheme?.useSeasonal);
        next();
        return;
      } catch (error) {
        logger.info(error);
      }

    if (req.url.includes('/api')) {
      res.writeHead(401);
      res.end();
      return;
    }
    res.redirect(authUrl);
  };

  return middleware;
}
