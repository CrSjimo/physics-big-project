<script setup lang="ts">
import {ref, computed} from 'vue';
import {useOsTheme, darkTheme, zhCN, NConfigProvider, NLayout, NLayoutHeader, NLayoutSider,
    NLayoutContent, NPageHeader, NDynamicInput, NInput, NInputNumber, NSelect, NButton, NSpace} from 'naive-ui';
import {sourceTypeOptions, generateScene, type SceneElement, type ParticleProps, calculate} from './interaction';
const themePreference = computed(()=>{
    return useOsTheme().value == 'dark' ? darkTheme : null;
});
let sceneElements = ref([] as SceneElement[]);
let particleProps = ref({} as ParticleProps);
let duration = ref(null as number|null);
</script>

<template>
    <NConfigProvider :theme="themePreference" :locale="zhCN" style="height: 100%;">
        <NLayout position="absolute">
            <NLayoutHeader bordered style="height: 64px;">
                <NPageHeader>
                    <template #title>
                        <h1 style="margin-left: 16px;">物理大作业</h1>
                    </template>
                </NPageHeader>
            </NLayoutHeader>
            <NLayoutContent position="absolute" style="top: 64px;">
                <NLayout has-sider position="absolute">
                    <NLayoutSider
                        bordered
                        :width="800">
                        <NSpace vertical id="input-container">
                            <NDynamicInput v-model:value="sceneElements" :on-create="()=>({type: 'E', x: null, y: null, r: null, q: null, B: null})">
                                <template #default="{ value }">
                                    <div style="display: flex; align-items: center; width: 100%">
                                        <NSelect 
                                            v-model:value="value.type"
                                            :options="sourceTypeOptions"
                                            style="margin-right: 12px; width: 120px"/>
                                        <NInputNumber
                                            v-model:value="value.x"
                                            :show-button="false"
                                            placeholder="x"
                                            style="margin-right: 12px; width: 60px"/>
                                        <NInputNumber
                                            v-model:value="value.y"
                                            :show-button="false"
                                            placeholder="y"
                                            style="margin-right: 12px; width: 60px"/>
                                        <template v-if="value.type == 'E'">
                                            <NInputNumber
                                                v-model:value="value.q"
                                                :show-button="false"
                                                placeholder="电荷量"
                                                :parse="(str)=>parseFloat(str)"
                                                style="width: 100px"/>
                                        </template>
                                        <template v-if="value.type == 'M'">
                                            <NInputNumber
                                                v-model:value="value.r"
                                                :show-button="false"
                                                placeholder="半径"
                                                style="margin-right: 12px; width: 100px"/>
                                            <NInputNumber
                                                v-model:value="value.B"
                                                :show-button="false"
                                                placeholder="磁感应强度"
                                                :parse="(str)=>parseFloat(str)"
                                                style="width: 100px"/>
                                        </template>
                                    </div>
                                </template>
                            </NDynamicInput>
                            <NButton style="width: 100%;" :on-click="()=>{generateScene(sceneElements);}">生成场景</NButton>
                            <NSpace class="props">
                                <NInputNumber v-model:value="particleProps.x" placeholder="初始位置 x"/>
                                <NInputNumber v-model:value="particleProps.y" placeholder="初始位置 y"/>
                            </NSpace>
                            <NSpace class="props">
                                <NInputNumber v-model:value="particleProps.v" placeholder="初始速度"/>
                                <NInputNumber v-model:value="particleProps.angle" placeholder="初始速度方向（角度）"/>
                            </NSpace>
                            <NSpace class="props">
                                <NInputNumber v-model:value="particleProps.m" :parse="(str)=>parseFloat(str)" placeholder="质量"/>
                                <NInputNumber v-model:value="particleProps.q" :parse="(str)=>parseFloat(str)" placeholder="电荷量"/>
                            </NSpace>
                            <NInputNumber v-model:value="duration" placeholder="持续时间"/>
                            <NButton style="width: 100%;" :on-click="() => {calculate(sceneElements, particleProps, Number(duration))}">计算轨迹</NButton>
                        </NSpace>
                    </NLayoutSider>
                    <NLayoutContent content-style="padding: 16px">
                        <canvas id="stage" width="800" height="600"></canvas>
                  </NLayoutContent>
              </NLayout>
          </NLayoutContent>
      </NLayout>
  </NConfigProvider>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

#input-container {
    margin: 8px;
}

#stage {
    background-color: white;
}
</style>

<style>
.props > * {
    flex-grow: 1;
}
</style>
