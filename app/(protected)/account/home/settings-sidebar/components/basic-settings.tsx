 'use client';
 
 import { useState } from 'react';
 import { AvatarInput } from '@/partials/common/avatar-input';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { Checkbox } from '@/components/ui/checkbox';
 
 const BasicSettings = () => {
   const [firstName, setFirstName] = useState('Hitesh');
   const [lastName, setLastName] = useState('Varyani');
   const [displayName, setDisplayName] = useState('Hitesh Varyani');
   const [headline, setHeadline] = useState('');
   const [bio, setBio] = useState('');
   const [socialLinksEnabled, setSocialLinksEnabled] = useState(true);
 
   const [registeredEmail, setRegisteredEmail] = useState('hiteshkv75@gmail.com');
   const [registeredPhone, setRegisteredPhone] = useState('+91 91669-15305');
 
   const [supportEmail, setSupportEmail] = useState('');
   const [supportPhone, setSupportPhone] = useState('');
   const [supportContactMethod, setSupportContactMethod] = useState<'email' | 'phone' | 'both'>('both');
 
   const [offersUpdates, setOffersUpdates] = useState(true);
   const [notifyPurchaseEmail, setNotifyPurchaseEmail] = useState(true);
   const [notifyPurchaseWhatsApp, setNotifyPurchaseWhatsApp] = useState(true);
 
   return (
     <>
       <Card>
         <CardHeader>
           <CardTitle>Basic information</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
               <Label className="text-sm">First name</Label>
               <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-2" />
             </div>
             <div>
               <Label className="text-sm">Last name</Label>
               <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2" />
             </div>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>About me info</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground mb-4">
             This is the default 'About me' info we show as a card on all your products. Talk about yourself and link your social accounts.
           </p>
           <div className="flex items-start gap-6">
             <div>
               <Label className="text-sm">Your image</Label>
               <div className="mt-2">
                 <AvatarInput />
               </div>
             </div>
             <div className="grow">
               <Label className="text-sm">Name</Label>
               <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-2" />
               <Label className="text-sm mt-4">Headline</Label>
               <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-2" />
               <Label className="text-sm mt-4">Bio</Label>
               <textarea
                 value={bio}
                 onChange={(e) => setBio(e.target.value)}
                 className="w-full mt-2 p-3 border rounded-md min-h-[120px]"
               />
               <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center gap-4">
                   <Label className="text-sm">Social Media Links</Label>
                   <Switch checked={socialLinksEnabled} onCheckedChange={(v) => setSocialLinksEnabled(!!v)} />
                 </div>
                 <Button variant="ghost" size="sm">Set up</Button>
               </div>
               <div className="mt-4">
                 <Label className="text-sm">Book a session with me</Label>
                 <div className="mt-2">
                   <Button size="sm">Set up</Button>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Signin information</CardTitle>
         </CardHeader>
         <CardContent>
           <Label className="text-sm">Registered email</Label>
           <div className="flex items-center gap-3 mt-2">
             <Input value={registeredEmail} onChange={(e) => setRegisteredEmail(e.target.value)} />
             <Button variant="outline" size="sm">Verify</Button>
           </div>

           <Label className="text-sm mt-4">Registered phone number</Label>
           <div className="flex items-center gap-3 mt-2">
             <Input value={registeredPhone} onChange={(e) => setRegisteredPhone(e.target.value)} />
             <Button variant="ghost" size="sm">Edit</Button>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Support Channel</CardTitle>
         </CardHeader>
         <CardContent>
           <Label className="text-sm">Email</Label>
           <div className="flex items-center gap-3 mt-2">
             <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
             <Button variant="outline" size="sm">Verify</Button>
           </div>
           <Label className="text-sm mt-4">Support phone number</Label>
           <div className="flex items-center gap-3 mt-2">
             <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
             <Button variant="outline" size="sm">Verify</Button>
           </div>
           <div className="mt-4">
             <Label className="text-sm">How would you like your customers to reach out to you in case of queries?</Label>
             <div className="mt-2 flex items-center gap-4">
               <label className="flex items-center gap-2"><input type="radio" name="support_method" checked={supportContactMethod==='email'} onChange={() => setSupportContactMethod('email')} /> Via Email address</label>
               <label className="flex items-center gap-2"><input type="radio" name="support_method" checked={supportContactMethod==='phone'} onChange={() => setSupportContactMethod('phone')} /> Via Phone number</label>
               <label className="flex items-center gap-2"><input type="radio" name="support_method" checked={supportContactMethod==='both'} onChange={() => setSupportContactMethod('both')} /> Via Both</label>
             </div>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Notifications</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="mb-4">
             <Label className="text-sm">Notify me about</Label>
             <div className="mt-2">
               <label className="flex items-center gap-2"><Checkbox checked={offersUpdates} onCheckedChange={(v) => setOffersUpdates(!!v)} />Offers and updates</label>
               <div className="text-xs text-muted-foreground mt-1">Notify me about SuperProfile updates and offers</div>
             </div>
           </div>

           <div>
             <Label className="text-sm">Notify my contacts about</Label>
             <div className="mt-2">
               <div className="flex items-center justify-between">
                 <div>
                   <div className="text-sm font-medium">Any Purchase</div>
                   <div className="text-xs text-muted-foreground">Notify customers when they make a purchase</div>
                 </div>
                 <div className="flex items-center gap-3">
                   <label className="flex items-center gap-2"><Checkbox checked={notifyPurchaseEmail} onCheckedChange={(v) => setNotifyPurchaseEmail(!!v)} />Email</label>
                   <label className="flex items-center gap-2"><Checkbox checked={notifyPurchaseWhatsApp} onCheckedChange={(v) => setNotifyPurchaseWhatsApp(!!v)} />WhatsApp</label>
                 </div>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     </>
   );
 };
 
 export { BasicSettings };
