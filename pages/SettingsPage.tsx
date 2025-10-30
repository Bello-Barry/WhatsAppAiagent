import React from 'react';
import { useAuth } from '../hooks/useAuth';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-dark-text-secondary mt-1">
                    Manage your account and billing information.
                </p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg">
                <div className="p-6">
                    <h3 className="text-xl font-semibold">Profile</h3>
                    <p className="text-dark-text-secondary mt-1">This information will be displayed on your invoices.</p>
                </div>
                <form>
                    <div className="p-6 border-t border-dark-border grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary">Email Address</label>
                            {/* FIX: Replaced custom 'input-style' class with Tailwind CSS classes to resolve style jsx error. */}
                            <input type="email" name="email" id="email" defaultValue={user?.email} readOnly className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-gray-800 cursor-not-allowed" />
                        </div>
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-dark-text-secondary">Full Name</label>
                            {/* FIX: Replaced custom 'input-style' class with Tailwind CSS classes to resolve style jsx error. */}
                            <input type="text" name="name" id="name" defaultValue="John Doe" className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-900/50 flex items-center justify-end rounded-b-lg">
                        <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:bg-gray-600">
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg">
                <div className="p-6">
                    <h3 className="text-xl font-semibold">Billing</h3>
                    <p className="text-dark-text-secondary mt-1">You are currently on the <span className="font-semibold text-brand-primary">Pro Plan</span>.</p>
                </div>
                 <div className="p-6 border-t border-dark-border">
                    <p className="text-dark-text-secondary">Your next bill for $49.00 is due on November 1, 2024.</p>
                    <button className="mt-4 px-5 py-2.5 text-sm font-medium border border-dark-border text-dark-text-primary rounded-lg hover:bg-dark-border">
                        Manage Subscription
                    </button>
                 </div>
            </div>
            
            {/* FIX: Removed unsupported <style jsx> block, which caused a compilation error. Styles are now handled by Tailwind CSS. */}
        </div>
    );
};

export default SettingsPage;