<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useGlobalState } from '../../store'
import { api } from '../../api'

const { userJwt, localeCache, userSettings, } = useGlobalState()
const router = useRouter()
const message = useMessage()

const showLogout = ref(false)

const { t } = useI18n({
    locale: localeCache.value || 'zh',
    messages: {
        en: {
            logout: 'Logout',
            logoutConfirm: 'Are you sure you want to logout?',
        },
        zh: {
            logout: '退出登录',
            logoutConfirm: '确定要退出登录吗？',
        }
    }
});


const logout = async () => {
    userJwt.value = '';
    location.reload()
}

const fetchData = async () => {
}

onMounted(async () => {
    await fetchData()
})
</script>

<template>
    <div class="center" v-if="userSettings.user_email">
        <n-card>
            <n-button @click="showLogout = true" secondary block strong>
                {{ t('logout') }}
            </n-button>
        </n-card>
        <n-modal v-model:show="showLogout" preset="dialog" :title="t('logout')">
            <p>{{ t('logoutConfirm') }}</p>
            <template #action>
                <n-button :loading="loading" @click="logout" size="small" tertiary type="primary">
                    {{ t('logout') }}
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<style scoped>
.center {
    display: flex;
    justify-content: center;
}


.n-card {
    max-width: 800px;
    text-align: left;
}

.n-button {
    margin-top: 10px;
}
</style>
