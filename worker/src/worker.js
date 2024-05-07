import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt'
import { Jwt } from 'hono/utils/jwt'

import { api } from './router';
import { api as MailsApi } from './mails_api'
import { api as userApi } from './user_api';
import { api as adminApi } from './admin_api';
import { api as apiV1 } from './deprecated';
import { api as apiSendMail } from './mails_api/send_mail_api'

import { email } from './email';
import { scheduled } from './scheduled';
import { getAdminPasswords, getPasswords } from './utils';

const app = new Hono()
//cors
app.use('/*', cors());
// rate limit
app.use('/*', async (c, next) => {
	if (
		c.req.path.startsWith("/api/new_address")
		|| c.req.path.startsWith("/api/send_mail")
		|| c.req.path.startsWith("/external/api/send_mail")
		|| c.req.path.startsWith("/user_api/register")
	) {
		const reqIp = c.req.raw.headers.get("cf-connecting-ip")
		if (reqIp && c.env.RATE_LIMITER) {
			const { success } = await c.env.RATE_LIMITER.limit(
				{ key: `${c.req.path}|${reqIp}` }
			)
			if (!success) {
				return c.text(`IP=${reqIp} Rate limit exceeded for ${c.req.path}`, 429)
			}
		}
	}
	await next()
});
// api auth
app.use('/api/*', async (c, next) => {
	// check header x-custom-auth
	const passwords = getPasswords(c);
	if (passwords && passwords.length > 0) {
		const auth = c.req.raw.headers.get("x-custom-auth");
		if (!auth || !passwords.includes(auth)) {
			return c.text("Need Password", 401)
		}
	}
	if (c.req.path.startsWith("/api/new_address")) {
		await next();
		return;
	}
	return jwt({ secret: c.env.JWT_SECRET })(c, next);
});
// user_api auth
app.use('/user_api/*', async (c, next) => {
	if (
		c.req.path.startsWith("/user_api/open_settings")
		|| c.req.path.startsWith("/user_api/register")
		|| c.req.path.startsWith("/user_api/login")
	) {
		await next();
		return;
	}
	try {
		const token = c.req.raw.headers.get("x-user-token");
		const payload = await Jwt.verify(token, c.env.JWT_SECRET);
		c.set("userPayload", payload);
	} catch (e) {
		console.error(e);
		return c.text("Need User Token", 401)
	}
	if (c.req.path.startsWith('/user_api/bind_address')) {
		return jwt({ secret: c.env.JWT_SECRET })(c, next);
	}
	await next();
});
// admin auth
app.use('/admin/*', async (c, next) => {
	// check header x-admin-auth
	const adminPasswords = getAdminPasswords(c);
	if (adminPasswords && adminPasswords.length > 0) {
		const adminAuth = c.req.raw.headers.get("x-admin-auth");
		if (adminAuth && adminPasswords.includes(adminAuth)) {
			await next();
			return;
		}
	}
	return c.text("Need Admin Password", 401)
});


app.route('/', api)
app.route('/', MailsApi)
app.route('/', userApi)
app.route('/', adminApi)
app.route('/', apiV1)
app.route('/', apiSendMail)

app.get('/', async c => c.text("OK"))
app.get('/health_check', async c => c.text("OK"))
app.all('/*', async c => c.text("Not Found", 404))


export default {
	fetch: app.fetch,
	email: email,
	scheduled: scheduled,
}
