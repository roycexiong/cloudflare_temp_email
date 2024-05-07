<script setup>
import { ref, h, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n'
import { NBadge } from 'naive-ui';

import { useGlobalState } from '../../store'
import { api } from '../../api'

const { localeCache } = useGlobalState()
const message = useMessage()

const { t } = useI18n({
    locale: localeCache.value || 'zh',
    messages: {
        en: {
            success: 'Success',
            user_email: 'User Email',
            address_count: 'Address Count',
            created_at: 'Created At',
            action: 'Action',
            query: 'Query',
            itemCount: 'itemCount',
            view: 'View',
        },
        zh: {
            success: '成功',
            user_email: '用户邮箱',
            address_count: '地址数量',
            created_at: '创建时间',
            action: '操作',
            query: '查询',
            itemCount: '总数',
            view: '查看',
        }
    }
});
const data = ref([])
const count = ref(0)
const page = ref(1)
const pageSize = ref(20)

const userQuery = ref('')

const fetchData = async () => {
    try {
        const { results, count: addressCount } = await api.fetch(
            `/admin/users`
            + `?limit=${pageSize.value}`
            + `&offset=${(page.value - 1) * pageSize.value}`
            + (userQuery.value ? `&query=${userQuery.value}` : '')
        );
        data.value = results.map((item) => {
            try {
                const data = JSON.parse(item.raw);
                item.to_mail = data?.personalizations?.map(
                    (p) => p.to?.map((t) => t.email).join(',')
                ).join(';');
                item.subject = data.subject;
                item.raw = JSON.stringify(data, null, 2);
            } catch (error) {
                console.log(error);
            }
            return item;
        });
        if (addressCount > 0) {
            count.value = addressCount;
        }
    } catch (error) {
        console.log(error)
        message.error(error.message || "error");
    }
}

const columns = [
    {
        title: "ID",
        key: "id"
    },
    {
        title: t('user_email'),
        key: "user_email"
    },
    {
        title: t('address_count'),
        key: "address_count",
        render(row) {
            return h(NBadge, {
                value: row.address_count,
                'show-zero': true,
                max: 99,
                type: "success"
            })
        }
    },
    {
        title: t('created_at'),
        key: "created_at"
    },
]

watch([page, pageSize], async () => {
    await fetchData()
})

onMounted(async () => {
    await fetchData()
})
</script>

<template>
    <div>
        <n-input-group>
            <n-input v-model:value="userQuery" />
            <n-button @click="fetchData" type="primary" tertiary>
                {{ t('query') }}
            </n-button>
        </n-input-group>
        <div style="display: inline-block;">
            <n-pagination v-model:page="page" v-model:page-size="pageSize" :item-count="count"
                :page-sizes="[20, 50, 100]" show-size-picker>
                <template #prefix="{ itemCount }">
                    {{ t('itemCount') }}: {{ itemCount }}
                </template>
            </n-pagination>
        </div>
        <n-data-table :columns="columns" :data="data" :bordered="false" />
    </div>
</template>

<style scoped>
.n-pagination {
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>
