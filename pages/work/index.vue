<template>
  <view class="service-page">
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <uni-icons type="search" size="20" color="#bbb"></uni-icons>
        <input
          class="search-input"
          placeholder="请输入服务类型"
          placeholder-style="color: #bbb"
          v-model="searchKeyword"
          @input="handleSearch"
        />
        <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
          <uni-icons type="clear" size="18" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 左侧分类导航 -->
      <view class="sidebar">
        <view
          class="category-item"
          :class="{ active: activeCategory === item.id }"
          v-for="item in categories"
          :key="item.id"
          @click="selectCategory(item.id)"
        >
          <text class="category-name">{{ item.name }}</text>
        </view>
      </view>

      <!-- 右侧内容区域 -->
      <view class="content-area">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <SkeletonLoader type="card" :rows="4" />
        </view>

        <!-- 内容区域 -->
        <view v-else>
          <!-- 子分类网格 -->
          <view v-if="getCurrentCategory().children && getCurrentCategory().children.length > 0" class="service-grid">
            <view
              class="service-item"
              v-for="subItem in getCurrentCategory().children"
              :key="subItem.id"
            >
              <!-- 子分类标题卡片 -->
              <view class="service-header" @click="selectSubcategory(subItem)">
                <text class="header-title">{{ subItem.name }}</text>
                <uni-icons type="right" size="14" color="#999"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <EmptyState v-else-if="!hasError" icon="search" text="暂无相关服务" buttonText="去看看" @action="goToHome" />
          <!-- 错误状态 -->
          <ErrorState v-else-if="hasError" message="加载失败" @retry="loadData" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { grouplistServicetype, listServiceitem } from '@/api/service'
  import config from '@/config.js'
  import SkeletonLoader from '@/components/skeleton/index.vue'
  import EmptyState from '@/components/empty-state/index.vue'
  import ErrorState from '@/components/error-state/index.vue'

  export default {
    components: { SkeletonLoader, EmptyState, ErrorState },
    data() {
      return {
        searchKeyword: '',
        activeCategory: '',
        loading: false,
        hasError: false,
        categories: [],
        filteredChildrenMap: {}, // 存储每个分类过滤后的子分类
        searchTimer: null, // 搜索防抖定时器
        isSearching: false, // 是否正在搜索
        targetCategory: '' // 目标分类，用于从首页跳转时定位
      }
    },
    methods: {
      goToHome() {
        uni.switchTab({ url: '/pages/index' })
      },
      selectCategory(categoryId) {
        this.activeCategory = categoryId;
      },

      getCurrentCategory() {
        const category = this.categories.find(item => item.id == this.activeCategory) || this.categories[0];
        
        if (!category) {
          return { children: [] };
        }
        
        // 如果正在搜索，返回过滤后的子分类
        if (this.isSearching && this.filteredChildrenMap[category.id]) {
          return {
            ...category,
            children: this.filteredChildrenMap[category.id]
          };
        }
        
        // 否则返回原始子分类
        return category;
      },

      async selectSubcategory(subItem) {
        try {
          uni.showLoading({
            title: '加载中...'
          });

          // 调用接口获取服务项列表
          const response = await listServiceitem({
            pageNum: 1,
            pageSize: 10,
            typeId: subItem.id
          });

          console.log('服务项列表响应:', response);

          if (response.code === 200 && response.rows) {
            // 将服务项列表和子分类信息存入缓存
            const cacheData = {
              typeId: subItem.id,
              typeName: subItem.name,
              typeDescription: subItem.description,
              typeImage: subItem.image,
              serviceList: response.rows,
              total: response.total || response.rows.length
            };

            uni.setStorageSync('serviceItemCache', cacheData);

            // 跳转到服务项页面
            uni.navigateTo({
              url: '/pages/server/index'
            });
          } else {
            uni.showToast({
              title: response.msg || '获取服务项失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('获取服务项失败:', error);
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        } finally {
          uni.hideLoading();
        }
      },

      // 处理搜索（防抖）
      handleSearch() {
        // 清除之前的定时器
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
        
        // 设置新的定时器，300ms后执行搜索
        this.searchTimer = setTimeout(() => {
          this.performSearch();
        }, 300);
      },
      
      // 执行搜索（前端过滤）
      performSearch() {
        const keyword = this.searchKeyword.trim().toLowerCase();
        
        if (!keyword) {
          // 没有搜索关键词，清空过滤结果
          this.filteredChildrenMap = {};
          this.isSearching = false;
          return;
        }
        
        this.isSearching = true;
        this.filteredChildrenMap = {};
        
        let firstMatchedCategoryId = null;
        
        // 过滤每个分类的子分类
        this.categories.forEach(category => {
          const matchedChildren = (category.children || []).filter(child => {
            const childName = (child.name || '').toLowerCase();
            const childDesc = (child.description || '').toLowerCase();
            return childName.includes(keyword) || childDesc.includes(keyword);
          });
          
          // 存储过滤结果
          if (matchedChildren.length > 0) {
            this.filteredChildrenMap[category.id] = matchedChildren;
            
            // 记录第一个有匹配结果的分类
            if (!firstMatchedCategoryId) {
              firstMatchedCategoryId = category.id;
            }
          }
        });
        
        // 自动定位到第一个有匹配结果的分类
        if (firstMatchedCategoryId) {
          this.activeCategory = firstMatchedCategoryId;
        }
        
        console.log('搜索结果:', {
          keyword,
          matchedCategories: Object.keys(this.filteredChildrenMap).length,
          totalChildren: Object.values(this.filteredChildrenMap).reduce((sum, children) => sum + children.length, 0)
        });
      },

      // 清除搜索
      clearSearch() {
        this.searchKeyword = '';
        
        // 清除防抖定时器
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
          this.searchTimer = null;
        }
        
        // 清空过滤结果
        this.filteredChildrenMap = {};
        this.isSearching = false;
      },

      // 获取服务类型列表
      async getServiceTypes() {
        try {
          this.loading = true;
          const response = await grouplistServicetype();

          console.log('完整的API响应:', response);

          if (response.code === 200 && response.rows) {
            // 转换API数据格式为组件需要的格式
            this.categories = this.transformServiceData(response.rows);

            // 设置默认选中第一个分类
            if (this.categories.length > 0) {
              // 如果有目标分类，设置对应分类
              if (this.targetCategory) {
                this.setTargetCategory();
              } else {
                this.activeCategory = this.categories[0].id;
              }
            } else {
              console.log('转换后的categories为空');
            }
          } else {
            console.log('API响应失败:', response);
            uni.showToast({
              title: '获取服务类型失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('获取服务类型失败:', error);
          this.hasError = true;
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        } finally {
          this.loading = false;
        }
      },

      // 转换API数据格式
      transformServiceData(apiData) {

        if (!Array.isArray(apiData)) {
          console.error('API数据不是数组:', apiData);
          return [];
        }

        // 先筛选出一级分类（parentId为0）
        const parentCategories = apiData.filter(item => item.parentId === 0);
        console.log('筛选出的一级分类:', parentCategories);

        const result = parentCategories.map(category => {
          // 找到该分类下的子分类（parentId等于当前分类的typeId）
          const children = apiData.filter(item => item.parentId === category.typeId);
          console.log(`分类 ${category.typeName} 的子分类:`, children);

          return {
            id: category.typeId,
            name: category.typeName,
            icon: this.getIconByName(category.typeName),
            description: category.description || `${category.typeName}相关服务`,
            children: children.map(subItem => ({
              id: subItem.typeId,
              name: subItem.typeName,
              description: subItem.description || `${subItem.typeName}服务`,
              image: this.getImageUrl(subItem.icon),
              tags: ['专业服务', '贴心照护']
            }))
          };
        });

        return result;
      },

      // 根据服务名称获取对应图标
      getIconByName(name) {
        const iconMap = {
          '助餐': 'meal',
          '助洁': 'gear',
          '助浴': 'water',
          '助行': 'person-filled',
          '助医': 'heart-filled',
          '助急': 'phone-filled'
        };
        return iconMap[name] || 'settings';
      },

      // 处理图片URL
      getImageUrl(iconPath) {
        // 如果iconPath为空，返回默认图片
        if (!iconPath) {
          return '/static/images/default-service.png';
        }

        // 如果是完整URL，直接返回
        if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
          return iconPath;
        }

        // 如果是相对路径，拼接服务器地址
        if (iconPath.startsWith('/')) {
          return config.baseUrl + iconPath;
        }

        // 其他情况返回默认图片
        return '/static/images/default-service.png';
      },

      // 设置目标分类
      setTargetCategory() {
        console.log('setTargetCategory - targetCategory:', this.targetCategory);
        console.log('setTargetCategory - categories:', this.categories.map(cat => cat.name));

        if (this.targetCategory && this.categories.length > 0) {
          const targetCat = this.categories.find(cat => cat.name === this.targetCategory);
          console.log('找到的目标分类:', targetCat);

          if (targetCat) {
            this.activeCategory = targetCat.id;
            console.log('设置activeCategory为:', this.activeCategory);
          } else {
            console.log('未找到匹配的分类，目标分类名称:', this.targetCategory);
          }
          // 清空目标分类
          this.targetCategory = '';
        }
      }
    },

    // 页面加载时获取数据
    onLoad(options) {
      this.getServiceTypes();
    },

    // 页面显示时检查是否有目标分类
    onShow() {
      // 检查本地存储中是否有目标分类
      const targetCategory = uni.getStorageSync('targetCategory');
      console.log('onShow - 从本地存储获取的目标分类:', targetCategory);

      if (targetCategory) {
        this.targetCategory = targetCategory;
        console.log('设置targetCategory为:', this.targetCategory);

        // 清除本地存储
        uni.removeStorageSync('targetCategory');

        // 如果数据已经加载完成，立即设置分类
        if (this.categories.length > 0) {
          console.log('数据已加载，立即设置分类');
          this.setTargetCategory();
        } else {
          console.log('数据未加载，等待数据加载完成');
        }
      }
    },

    // 页面卸载时清理
    onUnload() {
      // 清除搜索防抖定时器，避免内存泄漏
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }
    }
  }
</script>

<style lang="scss" scoped>
.service-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}


.search-container {
  background-color: #fff;
  padding: 20rpx 24rpx;
  /* box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03); */

  .search-box {
    display: flex;
    align-items: center;
    height: 72rpx;
    background: #f5f7fa;
    border-radius: 36rpx;
    padding: 0 32rpx;
    gap: 16rpx;
    transition: all 0.3s ease;
    border: 2rpx solid transparent;

    @include press-card();

    .search-input {
      flex: 1;
      font-size: $text-md;
      color: #333;
      height: 100%;

      &::placeholder {
        color: #bbb;
      }
    }

    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48rpx;
      height: 48rpx;
      margin-right: -12rpx;
      @include press-link();
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  background-color: #fff;
}

.sidebar {
  width: 200rpx;
  background-color: #f8f9fa;
  
  .category-item {
    padding: 32rpx 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;

    /* &:hover {
      background-color: #f0f2f5;
    } */

    &.active {
      background-color: #fff;
      
      &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6rpx;
          height: 32rpx;
          background-color: #1890ff;
          border-radius: 0 4rpx 4rpx 0;
      }

      .category-name {
        color: #1890ff;
        font-weight: 600;
        font-size: $text-lg;
      }
    }

    .category-name {
      font-size: $text-lg;
      color: #666;
      text-align: center;
      transition: all 0.3s ease;
    }

  }
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  background-color: #fff;
  padding: 20rpx 30rpx;
  overflow-y: auto;
}

.service-grid {
  display: flex;
  flex-direction: column;
  gap: 50rpx;
  padding: 10rpx 0 40rpx;
}

.service-item {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.service-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  @include press-card();
  cursor: pointer;
  transition: all 0.3s ease;

  .header-title {
    font-size: $text-lg;
    font-weight: 600;
    color: #333;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-icon-box {
    width: 140rpx;
    height: 140rpx;
    background: #f5f7fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: $text-md;
    color: #999;
    margin-top: 20rpx;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .loading-text {
    font-size: $text-md;
    color: #1890ff;
    margin-top: 20rpx;
  }
}

</style>