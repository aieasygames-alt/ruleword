import React, { useState } from 'react'
import emailjs from '@emailjs/browser'

// EmailJS 配置
const EMAILJS_CONFIG = {
  serviceId: 'service_2v1599e',
  templateId: 'template_9ee29rl',
  publicKey: 'A73GlvN7cp09bDjon',
}

type FeedbackType = 'bug' | 'feature' | 'game' | 'other'

interface FeedbackFormData {
  type: FeedbackType
  message: string
  email: string
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: '🐛 Bug 报告', labelEn: '🐛 Bug Report' },
  { value: 'feature', label: '💡 功能建议', labelEn: '💡 Feature Request' },
  { value: 'game', label: '🎮 游戏反馈', labelEn: '🎮 Game Feedback' },
  { value: 'other', label: '📝 其他', labelEn: '📝 Other' },
]

interface FeedbackProps {
  language: 'zh' | 'en'
  inline?: boolean  // 内联模式（在首页底部显示）
}

const Feedback: React.FC<FeedbackProps> = ({ language, inline = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'feature',
    message: '',
    email: '',
  })

  const t = {
    feedback: language === 'zh' ? '反馈' : 'Feedback',
    sendFeedback: language === 'zh' ? '发送反馈' : 'Send Feedback',
    type: language === 'zh' ? '反馈类型' : 'Feedback Type',
    message: language === 'zh' ? '详细描述' : 'Description',
    messagePlaceholder: language === 'zh' ? '请详细描述你的问题或建议...' : 'Please describe your issue or suggestion...',
    email: language === 'zh' ? '联系邮箱（可选）' : 'Email (optional)',
    emailPlaceholder: language === 'zh' ? '以便我们回复你' : 'For us to reply to you',
    send: language === 'zh' ? '发送' : 'Send',
    sending: language === 'zh' ? '发送中...' : 'Sending...',
    success: language === 'zh' ? '感谢你的反馈！' : 'Thanks for your feedback!',
    successDesc: language === 'zh' ? '我们会尽快处理' : 'We will process it soon',
    error: language === 'zh' ? '发送失败，请稍后重试' : 'Failed to send, please try again',
    close: language === 'zh' ? '关闭' : 'Close',
    another: language === 'zh' ? '再发一条' : 'Send Another',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.message.trim()) {
      setError(language === 'zh' ? '请填写详细描述' : 'Please fill in the description')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const templateParams = {
        from_name: formData.email || 'Anonymous',
        from_email: formData.email || 'Not provided',
        message_type: FEEDBACK_TYPES.find(t => t.value === formData.type)?.[language === 'zh' ? 'label' : 'labelEn'],
        message: formData.message,
        reply_to: formData.email || 'Not provided',
        submit_time: new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC',
      }

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      )

      setIsSuccess(true)
    } catch (err) {
      console.error('Feedback error:', err)
      setError(t.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSuccess(false)
    setError('')
    setFormData({
      type: 'feature',
      message: '',
      email: '',
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(handleReset, 300)
  }

  return (
    <>
      {/* 反馈按钮 - 根据模式显示不同样式 */}
      {inline ? (
        // 内联模式 - 在首页底部显示，与设置按钮样式一致
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1 rounded hover:bg-gray-700/30 text-sm"
          aria-label={t.feedback}
        >
          💬
        </button>
      ) : (
        // 悬浮模式 - 在其他页面显示
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 font-medium"
          aria-label={t.feedback}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="hidden sm:inline">{t.feedback}</span>
        </button>
      )}

      {/* 反馈弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 弹窗内容 */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {isSuccess ? (
              /* 成功状态 */
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t.success}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {t.successDesc}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {t.close}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {t.another}
                  </button>
                </div>
              </div>
            ) : (
              /* 反馈表单 */
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  {t.sendFeedback}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 反馈类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.type}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FEEDBACK_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.value as FeedbackType })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.type === type.value
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {language === 'zh' ? type.label : type.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 详细描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.message}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.messagePlaceholder}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      required
                    />
                  </div>

                  {/* 联系邮箱 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t.emailPlaceholder}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}

                  {/* 提交按钮 */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {t.send}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Feedback
