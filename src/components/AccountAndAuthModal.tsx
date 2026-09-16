import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Users,
  Building,
  Key,
  Smartphone,
  Mail,
  Lock,
  ArrowRight,
  LogOut,
  ChevronRight,
  Sparkles,
  Globe,
  DollarSign,
} from 'lucide-react';
import { UserAccount, SubscriptionPlan, UserTier, AuthProviderType } from '../types';

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter / Agency Solo',
    monthlyPriceUSD: 29,
    annualPriceUSD: 290,
    maxSites: 3,
    maxDeploymentsPerMonth: 100,
    includedSeats: 1,
    prioritySupport: false,
    features: [
      'Up to 3 Production Edge Sites',
      'Source: GitHub & GitLab Sync',
      'Deployments: Cloudflare Pages + Vercel',
      'Visual WYSIWYG & AST Code Editor',
      'Basic Webhook Forms & Analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Multi-Client Studio',
    badge: 'Most Popular',
    monthlyPriceUSD: 79,
    annualPriceUSD: 790,
    maxSites: 15,
    maxDeploymentsPerMonth: 1000,
    includedSeats: 5,
    prioritySupport: true,
    features: [
      '15 Multi-Tenant Client Domains',
      'Full Source: GitHub, GitLab, Bitbucket',
      'Full Deployment: Cloudflare, Vercel, Netlify',
      'Full Data: Supabase, Firebase, Sanity, Strapi, WP',
      'Commerce: Razorpay, Stripe, Shopify, WooCommerce',
      'Ops: Shiprocket, Google Analytics, Meta Pixel',
      'Priority 99.99% Edge SLA & Automated Rollbacks',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Agency Cloud',
    monthlyPriceUSD: 249,
    annualPriceUSD: 2490,
    maxSites: 999,
    maxDeploymentsPerMonth: 99999,
    includedSeats: 25,
    prioritySupport: true,
    features: [
      'Unlimited Sites & Custom White-Label Domains',
      'Single Sign-On (SAML/Okta, Google Workspace)',
      'Granular Role-Based Access Control (RBAC)',
      'Custom Dedicated Edge Workers & Zero-Latency CDN',
      'Twilio, WhatsApp Business & Resend Direct Gateways',
      'Dedicated Account Architect & 24/7 Phone Support',
    ],
  },
];

interface AccountAndAuthModalProps {
  currentUser: UserAccount;
  onUpdateUser: (updated: UserAccount) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const AccountAndAuthModal: React.FC<AccountAndAuthModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'sso' | 'apikeys'>('profile');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [planUpgradeNotice, setPlanUpgradeNotice] = useState<string | null>(null);

  // Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [organization, setOrganization] = useState(currentUser.organization);
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled);

  // New API Key generator state
  const [apiKeys, setApiKeys] = useState<string[]>([
    'sqg_live_sec_99481923847192',
    'sqg_test_pub_33819237418239',
  ]);
  const [newKeyLabel, setNewKeyLabel] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      organization,
      twoFactorEnabled: twoFactor,
    });
    setPlanUpgradeNotice('Account security & profile preferences saved!');
    setTimeout(() => setPlanUpgradeNotice(null), 3000);
  };

  const handleSelectPlan = (planId: UserTier) => {
    onUpdateUser({
      ...currentUser,
      plan: planId,
    });
    setPlanUpgradeNotice(`Subscription successfully upgraded to ${planId.toUpperCase()}!`);
    setTimeout(() => setPlanUpgradeNotice(null), 4000);
  };

  const handleGenerateKey = () => {
    if (!newKeyLabel) return;
    const key = `sqg_live_${newKeyLabel.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 10)}`;
    setApiKeys((prev) => [key, ...prev]);
    setNewKeyLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141712] border border-[#2e3627] rounded-2xl max-w-4xl w-full text-neutral-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#232720] flex items-center justify-between bg-[#10120d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e2319] border border-[#2e3626] flex items-center justify-center font-bold text-[#e8ff75]">
              {currentUser.avatar || 'SS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{currentUser.name}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-lime-950 text-lime-400 border border-lime-800 font-bold">
                  {currentUser.plan.toUpperCase()} PLAN
                </span>
                {currentUser.isInternalSquargraph && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    SQUARGRAPH Internal Team
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentUser.email} · {currentUser.organization}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-[#232720] bg-[#121510] px-6 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#e8ff75] text-[#e8ff75]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Profile & Security
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'billing'
                ? 'border-[#e8ff75] text-[#e8ff75]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <CreditCard size={13} />
            Subscription & Plans
          </button>
          <button
            onClick={() => setActiveTab('sso')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sso'
                ? 'border-[#e8ff75] text-[#e8ff75]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={13} />
            SSO & Client Auth
          </button>
          <button
            onClick={() => setActiveTab('apikeys')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'apikeys'
                ? 'border-[#e8ff75] text-[#e8ff75]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key size={13} />
            API Keys & Webhooks
          </button>
        </div>

        {/* Notification Banner */}
        {planUpgradeNotice && (
          <div className="bg-lime-950/80 border-b border-lime-800 text-lime-300 text-xs px-6 py-2.5 flex items-center gap-2">
            <Check size={14} />
            <span>{planUpgradeNotice}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 1. Profile & Security */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d0f0c] border border-[#2b3323] rounded-lg px-3 py-2 text-sm text-white focus:border-[#e8ff75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Organization / Client Brand
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-[#0d0f0c] border border-[#2b3323] rounded-lg px-3 py-2 text-sm text-white focus:border-[#e8ff75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Verified Identity Provider
                </label>
                <div className="p-3 rounded-lg bg-[#0d0f0c] border border-[#232720] flex items-center justify-between text-xs">
                  <span className="font-mono text-lime-400 capitalize flex items-center gap-2">
                    <ShieldCheck size={14} /> {currentUser.provider} Secure Auth
                  </span>
                  <span className="text-neutral-500">Connected</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1a1e16] border border-[#2d3625]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Enforce hardware token / authenticator app confirmation on deployments.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    className="w-5 h-5 accent-[#e8ff75] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold text-xs text-black bg-[#e8ff75] hover:bg-[#dcfa5a] transition-all"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </form>
          )}

          {/* 2. Billing & Subscription Plans */}
          {activeTab === 'billing' && (
            <div>
              {/* Billing Cycle Switcher */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#232720]">
                <div>
                  <h3 className="font-bold text-white text-base">Subscription Plans & Licences</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    For SQUARGRAPH internal teams and external client companies subscribing to Site Control.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#0e110c] p-1 rounded-lg border border-[#232720] text-xs">
                  <button
                    onClick={() => setSelectedBillingCycle('monthly')}
                    className={`px-3 py-1 rounded font-semibold ${
                      selectedBillingCycle === 'monthly'
                        ? 'bg-[#e8ff75] text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedBillingCycle('annual')}
                    className={`px-3 py-1 rounded font-semibold flex items-center gap-1.5 ${
                      selectedBillingCycle === 'annual'
                        ? 'bg-[#e8ff75] text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Annual <span className="text-[10px] text-lime-900 bg-lime-400 px-1 rounded font-bold">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = currentUser.plan === plan.id;
                  const price =
                    selectedBillingCycle === 'annual'
                      ? Math.round(plan.annualPriceUSD / 12)
                      : plan.monthlyPriceUSD;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-[#e8ff75] bg-[#161a12] shadow-lg shadow-lime-950/20'
                          : 'border-[#232720] bg-[#11140f] hover:border-[#384230]'
                      }`}
                    >
                      <div>
                        {plan.badge && (
                          <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-lime-400 text-black mb-3">
                            {plan.badge}
                          </span>
                        )}
                        <h4 className="font-bold text-white text-base">{plan.name}</h4>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">${price}</span>
                          <span className="text-xs text-neutral-400">/ month</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Billed {selectedBillingCycle === 'annual' ? `$${plan.annualPriceUSD}/yr` : 'monthly'}
                        </p>

                        <div className="mt-5 space-y-2 text-xs">
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-neutral-300">
                              <Check size={14} className="text-lime-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isCurrent}
                        className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-[#232a1b] text-lime-400 border border-lime-800/40 cursor-default'
                            : 'bg-[#e8ff75] text-black hover:bg-[#dcfa5a]'
                        }`}
                      >
                        {isCurrent ? 'Current Active Plan' : `Upgrade to ${plan.name.split(' ')[0]}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. SSO & Authentication Gateways */}
          {activeTab === 'sso' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-bold text-white text-base">Client & Corporate SSO</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Allow team members and external stakeholders to access with company credentials.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#121510] border border-[#232720] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-sm">
                      G
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Google Workspace SSO</h4>
                      <p className="text-xs text-neutral-400">OAuth 2.0 with GSuite domain lock</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-lime-400 bg-lime-950 px-2 py-1 rounded border border-lime-800">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#121510] border border-[#232720] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-sm border border-neutral-700">
                      
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Apple ID for Enterprise</h4>
                      <p className="text-xs text-neutral-400">Private Relay & Touch ID Sign in</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-lime-400 bg-lime-950 px-2 py-1 rounded border border-lime-800">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#121510] border border-[#232720] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#1e2319] text-[#e8ff75] flex items-center justify-center font-bold text-sm">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">SQUARGRAPH Internal Directory</h4>
                      <p className="text-xs text-neutral-400">Zero-Trust Cloudflare Access</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-lime-400 bg-lime-950 px-2 py-1 rounded border border-lime-800">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. API Keys & Webhooks */}
          {activeTab === 'apikeys' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-bold text-white text-base">API Tokens & Webhook Secrets</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Use these credentials to authenticate with SQUARGRAPH Edge APIs programmatically.
                </p>
              </div>

              {/* Generate New Key */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key label (e.g. Production CI runner)"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  className="flex-1 bg-[#0d0f0c] border border-[#2b3323] rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  className="px-4 py-2 rounded-lg bg-[#e8ff75] text-black font-bold text-xs hover:bg-[#dcfa5a]"
                >
                  Generate Key
                </button>
              </div>

              {/* Keys list */}
              <div className="space-y-2">
                {apiKeys.map((key, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0e110c] border border-[#232720] flex items-center justify-between font-mono text-xs"
                  >
                    <span className="text-neutral-300 truncate max-w-xs">{key}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(key)}
                      className="text-lime-400 hover:underline font-sans text-xs"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
