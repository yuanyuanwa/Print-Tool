<template>
  <div class="list-page page-container">
    <h1 class="page-title">数据列表</h1>

    <!-- 搜索筛选 -->
    <div class="card filter-section">
      <el-form 
        :model="filterForm" 
        :inline="!isMobile"
        class="filter-form"
        @submit.prevent="handleSearch"
      >
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="请输入关键词"
            clearable
            :style="{ width: isMobile ? '100%' : '200px' }"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            :style="{ width: isMobile ? '100%' : '150px' }"
          >
            <el-option label="正常" :value="0" />
            <el-option label="禁用" :value="1" />
            <el-option label="待审核" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :style="{ width: isMobile ? '100%' : '280px' }"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
      <div class="action-right">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 数据表格（PC端） -->
    <div class="card table-section" v-if="!isMobile">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 数据卡片（移动端） -->
    <div class="card-list" v-else v-loading="loading">
      <div 
        class="data-card" 
        v-for="item in tableData" 
        :key="item.id"
      >
        <div class="card-header">
          <h4>{{ item.title }}</h4>
          <el-tag :type="getStatusType(item.status)" size="small">
            {{ getStatusText(item.status) }}
          </el-tag>
        </div>
        <p class="card-desc">{{ item.description }}</p>
        <div class="card-meta">
          <span>ID: {{ item.id }}</span>
          <span>{{ formatTime(item.createTime) }}</span>
        </div>
        <div class="card-actions">
          <el-button type="primary" size="small" @click="handleView(item)">
            查看
          </el-button>
          <el-button size="small" @click="handleEdit(item)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(item)">
            删除
          </el-button>
        </div>
      </div>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无数据" />
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 详情/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="isMobile ? '95%' : '600px'"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :disabled="dialogMode === 'view'"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="正常" :value="0" />
            <el-option label="禁用" :value="1" />
            <el-option label="待审核" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          v-if="dialogMode !== 'view'" 
          type="primary" 
          :loading="submitting"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Plus, 
  Delete, 
  Download 
} from '@element-plus/icons-vue'
import { useResponsive } from '@/hooks/useResponsive'
import { 
  getListData, 
  createListItem, 
  updateListItem, 
  deleteListItem, 
  batchDeleteListItems 
} from '@/api/list'
import type { ListItem } from '@/types'

const { isMobile } = useResponsive()

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: undefined as number | undefined
})
const dateRange = ref<string[]>([])

// 表格数据
const tableData = ref<ListItem[]>([])
const loading = ref(false)
const selectedRows = ref<ListItem[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive({
  id: 0,
  title: '',
  description: '',
  status: 0
})

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => {
  const titles = {
    add: '新增数据',
    edit: '编辑数据',
    view: '查看详情'
  }
  return titles[dialogMode.value]
})

// 获取列表数据
async function fetchData() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword || undefined,
      status: filterForm.status,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }
    const result = await getListData(params)
    tableData.value = result.list
    pagination.total = result.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  filterForm.keyword = ''
  filterForm.status = undefined
  dateRange.value = []
  handleSearch()
}

function handleSelectionChange(selection: ListItem[]) {
  selectedRows.value = selection
}

function handleSizeChange() {
  pagination.page = 1
  fetchData()
}

function handlePageChange() {
  fetchData()
}

function handleAdd() {
  dialogMode.value = 'add'
  formData.id = 0
  formData.title = ''
  formData.description = ''
  formData.status = 0
  dialogVisible.value = true
}

function handleView(row: ListItem) {
  dialogMode.value = 'view'
  Object.assign(formData, row)
  dialogVisible.value = true
}

function handleEdit(row: ListItem) {
  dialogMode.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

async function handleDelete(row: ListItem) {
  try {
    await ElMessageBox.confirm('确定要删除该数据吗？', '提示', {
      type: 'warning'
    })
    
    await deleteListItem(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(item => item.id)
    await batchDeleteListItems(ids)
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

function handleExport() {
  ElMessage.info('导出功能开发中...')
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (dialogMode.value === 'add') {
        await createListItem(formData)
        ElMessage.success('新增成功')
      } else {
        await updateListItem(formData.id, formData)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch (error) {
      ElMessage.error(dialogMode.value === 'add' ? '新增失败' : '更新失败')
    } finally {
      submitting.value = false
    }
  })
}

function handleDialogClose() {
  formRef.value?.resetFields()
}

function getStatusType(status: number) {
  const types: Record<number, 'success' | 'danger' | 'warning'> = {
    0: 'success',
    1: 'danger',
    2: 'warning'
  }
  return types[status] || 'info'
}

function getStatusText(status: number) {
  const texts: Record<number, string> = {
    0: '正常',
    1: '禁用',
    2: '待审核'
  }
  return texts[status] || '未知'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.list-page {
  animation: fadeIn 0.5s ease-out;
}

// 筛选区
.filter-section {
  margin-bottom: $spacing-lg;
}

.filter-form {
  :deep(.el-form-item) {
    margin-bottom: $spacing-md;
    
    @include mobile {
      margin-bottom: $spacing-sm;
    }
  }
  
  :deep(.el-form-item__label) {
    color: $text-secondary;
  }
}

// 操作栏
.action-bar {
  @include flex-between;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
  gap: $spacing-sm;
  
  .action-left,
  .action-right {
    display: flex;
    gap: $spacing-sm;
  }
}

// 表格区
.table-section {
  margin-bottom: $spacing-lg;
  overflow: hidden;
  
  :deep(.el-table) {
    border-radius: $radius-md;
  }
}

// 移动端卡片列表
.card-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.data-card {
  @include tech-card;
  padding: $spacing-md;
  
  .card-header {
    @include flex-between;
    margin-bottom: $spacing-sm;
    
    h4 {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-primary;
      @include text-ellipsis;
      flex: 1;
      margin-right: $spacing-sm;
    }
  }
  
  .card-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    @include text-ellipsis(2);
    margin-bottom: $spacing-sm;
  }
  
  .card-meta {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-xs;
    color: $text-muted;
    margin-bottom: $spacing-md;
  }
  
  .card-actions {
    display: flex;
    gap: $spacing-sm;
    border-top: 1px solid $border-light;
    padding-top: $spacing-md;
  }
}

// 分页
.pagination-section {
  @include flex-center;
  padding: $spacing-lg 0;
}
</style>
