import { CONSTANTS } from '../constants';
import { getJsonSetting, getBooleanValue, saveSetting } from '../utils';
import { UserSettings } from "../models";

export default {
    getSetting: async (c) => {
        const value = await getJsonSetting(c, CONSTANTS.USER_SETTINGS_KEY);
        const settings = new UserSettings(value);
        return c.json(settings)
    },
    saveSetting: async (c) => {
        if (!getBooleanValue(c.env.ENABLE_USER)) {
            return c.text("Please enable ENABLE_USER first", 403)
        }
        const value = await c.req.json();
        const settings = new UserSettings(value);
        if (settings.enableMailVerify && !c.env.KV) {
            return c.text("Please enable KV first if you want to enable mail verify", 403)
        }
        await saveSetting(c, CONSTANTS.USER_SETTINGS_KEY, JSON.stringify(settings));
        return c.json({ success: true })
    },
    getUsers: async (c) => {
        const { limit, offset, query } = c.req.query();
        if (!limit || limit < 0 || limit > 100) {
            return c.text("Invalid limit", 400)
        }
        if (!offset || offset < 0) {
            return c.text("Invalid offset", 400)
        }
        if (query) {
            const { results } = await c.env.DB.prepare(
                `SELECT u.id, u.user_email, u.created_at, u.updated_at,`
                + ` (SELECT COUNT(*) FROM users_address WHERE user_id = u.id) AS address_count`
                + ` FROM users u`
                + ` where u.user_email like ?`
                + ` order by u.id desc limit ? offset ?`
            ).bind(`%${query}%`, limit, offset).all();
            let count = 0;
            if (offset == 0) {
                const { count: userCount } = await c.env.DB.prepare(
                    `SELECT count(*) as count FROM users where user_email like ?`
                ).bind(`%${query}%`).first();
                count = userCount;
            }
            return c.json({
                results: results,
                count: count
            })
        }
        const { results } = await c.env.DB.prepare(
            `SELECT u.id, u.user_email, u.created_at, u.updated_at,`
            + ` (SELECT COUNT(*) FROM users_address WHERE user_id = u.id) AS address_count`
            + ` FROM users u`
            + ` order by u.id desc limit ? offset ?`
        ).bind(limit, offset).all();
        let count = 0;
        if (offset == 0) {
            const { count: userCount } = await c.env.DB.prepare(
                `SELECT count(*) as count FROM users`
            ).first();
            count = userCount;
        }
        return c.json({
            results: results,
            count: count
        })
    },
}
