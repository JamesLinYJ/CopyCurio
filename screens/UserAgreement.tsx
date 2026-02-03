
import React from 'react';
import { AppView, NavigationProps } from '../types';

export const UserAgreement: React.FC<NavigationProps> = ({ navigate }) => {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen font-sans transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center shadow-sm">
        <button onClick={() => navigate(AppView.PROFILE)} className="mr-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">用户服务协议</h1>
      </header>
      
      <main className="p-6 pb-24 max-w-3xl mx-auto">
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
          <p className="text-xs text-slate-400 mb-6">版本：2.0 | 生效日期：2025年05月20日</p>
          
          <h3 className="text-slate-900 dark:text-white font-bold text-base mb-2">一、导言</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-justify">
            欢迎使用“万象解惑”（以下简称“本App”）。本App致力于利用人工智能技术为儿童提供有趣的百科知识探索服务。请家长在允许孩子使用前，务必仔细阅读本协议。使用本App即表示您同意受本协议约束。
          </p>

          <Section title="二、关于 AI 生成内容的免责声明">
            <p>1. <strong>技术原理：</strong>本App提供的对话、图像识别结果均由人工智能模型（Google Gemini）自动生成，并非人工编辑。</p>
            <p>2. <strong>准确性提示：</strong>尽管我们通过提示词工程努力让 AI 输出准确、适合儿童的内容，但 AI 仍可能产生“幻觉”（即生成看似合理但实际错误的信息）。<strong>本App的所有内容仅供娱乐和启发，不应作为绝对的科学事实或学习教材。</strong></p>
            <p>3. <strong>家长监护：</strong>我们强烈建议家长对孩子获取的 AI 内容进行适当的引导和甄别。</p>
          </Section>

          <Section title="三、数据存储与丢失风险">
            <p>1. <strong>本地存储机制：</strong>本App不提供云端账号同步功能。所有的收藏、聊天记录都存储在您当前的设备上（IndexedDB/LocalStorage）。</p>
            <p>2. <strong>数据丢失风险：</strong>如果您卸载本App、清除App缓存或设备损坏，<strong>您的所有使用数据将会永久丢失且无法找回</strong>。请您知悉并自行承担此风险。</p>
          </Section>

          <Section title="四、用户行为规范">
            <p>用户（及监护人）在使用本App时，不得进行以下行为：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>诱导 AI 生成暴力、色情、政治敏感或违反法律法规的内容。</li>
              <li>利用本App进行任何形式的欺诈或恶意传播。</li>
              <li>尝试反向工程、破解本App的源代码或接口。</li>
            </ul>
          </Section>

          <Section title="五、知识产权">
            <p>1. 本App的界面设计、代码、Q-Bot 形象等知识产权归开发者所有。</p>
            <p>2. 用户使用 AI 生成的知识卡片、对话内容，用户可将其用于非商业目的（如个人学习、分享给朋友）。</p>
          </Section>

          <Section title="六、美术素材说明">
            <p>本App内使用的所有图标、插画均为：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Google Material Symbols (开源字体图标)</li>
              <li>开发者自制的 SVG 矢量图形（本地内置）</li>
            </ul>
            <p>所有素材均不涉及侵犯第三方版权，且存储于 App 本地代码中，无需联网下载。</p>
          </Section>

          <Section title="七、协议修改">
            <p>我们可能会不时更新本协议。重大变更将在 App 内进行弹窗提示。继续使用本 App 即代表您接受修改后的协议。</p>
          </Section>

          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-slate-400">如有疑问，请联系：support@curio-app.com</p>
          </div>
        </div>
      </main>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-slate-900 dark:text-white font-bold text-base mb-3">{title}</h3>
    <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-justify space-y-2">
      {children}
    </div>
  </div>
);
