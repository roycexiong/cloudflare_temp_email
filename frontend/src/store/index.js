import { ref } from "vue";
import { createGlobalState, useStorage, useDark, useToggle } from '@vueuse/core'

export const useGlobalState = createGlobalState(
    () => {
        const isDark = useDark()
        const toggleDark = useToggle(isDark)
        const loading = ref(false);
        const openSettings = ref({
            prefix: '',
            needAuth: false,
            adminContact: '',
            enableUserCreateEmail: false,
            enableUserDeleteEmail: false,
            enableAutoReply: false,
            domains: [],
            copyright: 'Dream Hunter',
            cfTurnstileSiteKey: '',
            enableUser: false,
        })
        const settings = ref({
            fetched: false,
            has_v1_mails: false,
            send_balance: 0,
            address: '',
            auto_reply: {
                subject: '',
                message: '',
                enabled: false,
                source_prefix: '',
                name: '',
            }
        });
        const sendMailModel = useStorage('sendMailModel', {
            fromName: "",
            toName: "",
            toMail: "",
            subject: "",
            contentType: 'text',
            content: "",
        });
        const showAuth = ref(false);
        const showAddressCredential = ref(false);
        const showAdminAuth = ref(false);
        const auth = useStorage('auth', '');
        const adminAuth = useStorage('adminAuth', '');
        const jwt = useStorage('jwt', '');
        const localeCache = useStorage('locale', 'zh');
        const adminTab = ref("account");
        const adminMailTabAddress = ref("");
        const adminSendBoxTabAddress = ref("");
        const mailboxSplitSize = useStorage('mailboxSplitSize', 0.25);
        const useIframeShowMail = useStorage('useIframeShowMail', false);
        const preferShowTextMail = useStorage('preferShowTextMail', false);
        const userJwt = useStorage('userJwt', '');
        const userTab = useStorage('userTab', 'user_settings');
        const indexTab = useStorage('indexTab', 'mailbox');
        const userOpenSettings = ref({
            enable: false,
            enableMailVerify: false,
        });
        const userSettings = ref({
            /** @type {boolean} */
            fetched: false,
            /** @type {string} */
            user_email: '',
            /** @type {number} */
            user_id: 0,
        });
        return {
            isDark,
            toggleDark,
            loading,
            settings,
            sendMailModel,
            openSettings,
            showAuth,
            showAddressCredential,
            auth,
            jwt,
            localeCache,
            adminAuth,
            showAdminAuth,
            adminTab,
            adminMailTabAddress,
            adminSendBoxTabAddress,
            mailboxSplitSize,
            useIframeShowMail,
            preferShowTextMail,
            userJwt,
            userTab,
            indexTab,
            userOpenSettings,
            userSettings,
        }
    },
)
