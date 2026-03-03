import React from 'react';
import { FeatureCard } from '../../components/website/FeatureCard';
import { AboutPage } from './AboutPage';
import { Droplets, Thermometer, CloudRain, MoveVertical, Wind, Smartphone, Bell, ToggleLeft } from 'lucide-react';
export function FeaturesPage() {
  return <div>
      <AboutPage />

      <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h1>
          <p className="text-xl text-gray-500">
            Discover the intelligent capabilities that make our system the
            smartest way to dry clothes.
          </p>
        </div>

        {/* Smart Sensors */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Sensors</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Droplets size={24} />} title="Humidity Sensing" description="Continuously monitors air moisture levels to determine drying progress." />
            <FeatureCard icon={<Thermometer size={24} />} title="Temp Monitoring" description="Tracks ambient temperature to adjust heating assistance accordingly." />
            <FeatureCard icon={<CloudRain size={24} />} title="Rain Detection" description="High-sensitivity sensor detects the first drops of rain instantly." />
          </div>
        </div>

        {/* Automation */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Intelligent Automation
            </h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<MoveVertical size={24} />} title="Auto Retraction" description="Motorized rod automatically retracts under cover when rain is detected or humidity spikes." />
            <FeatureCard icon={<CloudRain size={24} />} title="Predictive Response" description="Uses trend analysis of sensor data to predict rain before it starts pouring." />
            <FeatureCard icon={<Wind size={24} />} title="Climate Control" description="Automatically activates fans and heaters when natural drying conditions are poor." />
          </div>
        </div>

        {/* User Control */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h2 className="text-2xl font-bold text-gray-900">User Control</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<Smartphone size={24} />} title="Mobile Monitoring" description="View real-time status of your laundry from anywhere using our companion app." />
            <FeatureCard icon={<ToggleLeft size={24} />} title="Manual Override" description="Take full control with manual extend/retract and fan/heater toggles." />
            <FeatureCard icon={<Bell size={24} />} title="Smart Alerts" description="Receive instant notifications when drying is complete or if issues arise." />
          </div>
        </div>
      </div>
      </section>
    </div>;
}