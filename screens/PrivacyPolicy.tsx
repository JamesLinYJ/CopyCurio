
import React from 'react';
import { AppView, NavigationProps } from '../types';

export const PrivacyPolicy: React.FC<NavigationProps> = ({ navigate }) => {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen font-sans transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center shadow-sm">
        <button onClick={() => navigate(AppView.PROFILE)} className="mr-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">隐私政策</h1>
      </header>

      <main className="p-6 pb-24 max-w-3xl mx-auto">
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
          <p className="text-xs text-slate-400 mb-6">最后更新日期：2025年05月20日</p>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 mb-8">
            <h4 className="text-emerald-700 dark:text-emerald-300 font-bold text-sm mb-2 flex items-center gap-2">
              <span className="material-symbols-rounded text-sm">shield</span>
              我们的核心承诺
            </h4>
            <p className="text-emerald-600 dark:text-emerald-200/80 text-xs leading-relaxed">
              “万象解惑” 是一款专为儿童设计的应用。我们采用 **"本地优先 (Local-First)"** 架构。这意味着，您的聊天记录、收藏的知识卡片和应用设置 **全部存储在您的设备本地**，我们不会在云端服务器永久保存您的个人数据。
            </p>
          </div>

          <Section title="一、儿童隐私特别说明">
            <p>我们深知保护儿童个人信息的重要性。本应用：</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>不要求注册账户：</strong>孩子可以直接使用，无需提供姓名、电话或邮箱。</li>
              <li><strong>不进行广告追踪：</strong>应用内无第三方广告SDK，不会根据孩子的行为进行广告画像。</li>
              <li><strong>家长控制：</strong>建议家长陪同孩子使用，并利用“空间管家”功能管理本地数据。</li>
            </ul>
          </Section>

          <Section title="二、我们需要收集哪些信息">
            <p>为了提供 AI 互动服务，我们会处理以下最少量的必要信息：</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>您输入的内容：</strong>您在对话框发送的文本、问题。</li>
              <li><strong>图像数据（仅限本地）：</strong>您使用“万象视界”拍摄的照片。<strong>注意：</strong>照片用于向 AI 获取识别结果，处理后即刻销毁，不会上传至我们的服务器留存。</li>
              <li><strong>设备权限：</strong>
                 <ul className="list-circle pl-5 mt-1 text-xs text-slate-500">
                    <li>相机：用于拍摄物体识别。</li>
                    <li>存储：用于将生成的知识卡片保存到您的相册（需您主动操作）。</li>
                 </ul>
              </li>
            </ul>
          </Section>

          <Section title="三、第三方 AI 服务的使用">
            <p>本应用的核心智能能力由 <strong>Google Gemini API</strong> 提供支持。</p>
            <p>当您发送问题或图片时，该数据会被加密传输至 Google 的服务器进行处理以生成回答。根据 Google 的数据政策，通过 API 提交的数据不会被用于训练其公共模型，且会受到严格的安全保护。</p>
          </Section>

          <Section title="四、数据存储位置">
            <p><strong>所有数据都在您的手机里。</strong></p>
            <p>我们使用设备自带的 IndexedDB 和 LocalStorage 技术。您可以随时在无网络（离线）状态下查看之前的聊天记录和收藏，这证明了数据确实在您手中。</p>
          </Section>

          <Section title="五、您如何管理您的信息">
            <p>由于数据存储在本地，拥有完全的控制权：</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>清除历史：</strong>在聊天界面点击垃圾桶图标，可删除当前对话。</li>
              <li><strong>重置应用：</strong>在“设置-空间管家”中，点击“恢复出厂设置”，将彻底清除应用内的所有数据，且无法恢复（因为我们没有云端备份）。</li>
            </ul>
          </Section>

          <Section title="六、联系我们">
            <p>如您对本隐私政策或儿童个人信息保护有任何疑问，请联系我们的隐私保护专员：</p>
            <p className="font-bold mt-2">privacy@curio-app.com</p>
          </Section>

          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-slate-400">万象解惑 (Curio) 团队 © 2025</p>
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
