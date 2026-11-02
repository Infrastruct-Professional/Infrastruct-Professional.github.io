import { TelegramSystem } from '../telegram/telegram-system.js';
import { WhatsappSystem } from '../whatsapp/whatsapp-system.js';
import { GithubSystem } from '../github/github-system.js';
import { GoogleSystem } from '../google/google-system.js';
import { MicrosoftSystem } from '../microsoft/microsoft-system.js';
import { LinuxSystem } from '../linux/linux-system.js';
import { DebianSystem } from '../debian/debian-system.js';
import { FedoraSystem } from '../fedora/fedora-system.js';
import { AndroidSystem } from '../android/android-system.js';
import { IosSystem } from '../ios/ios-system.js';
/** Integration registry for provider contracts and browser-reported OS adapters. */
export class IntegrationRegistry {
  constructor(host){this.host=host;this.systems={
      telegram:new TelegramSystem(host),
      whatsapp:new WhatsappSystem(host),
      github:new GithubSystem(host),
      google:new GoogleSystem(host),
      microsoft:new MicrosoftSystem(host),
      linux:new LinuxSystem(host),
      debian:new DebianSystem(host),
      fedora:new FedoraSystem(host),
      android:new AndroidSystem(host),
      ios:new IosSystem(host),
    };this.registry={systems:{instances:Object.values(this.systems),functions:{},nested:{},events:[]}};}
  snapshot(){return Object.fromEntries(Object.entries(this.systems).map(([name,system])=>[name,system.snapshot()]));}
}
