'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useMeLinkPage, useProfileBlocks, updateProfile } from '@/features/superyou/content-blocks';

const STORE_LINK_BASE = 'superprofile.bio';

export function StoreSettings() {
  const { data: session } = useSession();
  const token = (session as { beeToken?: string } | null)?.beeToken ?? null;
  const { data: meLinkPageData, refetch: refetchMeLinkPage } = useMeLinkPage();
  const { profileId, profileSlug } = useProfileBlocks([]);

  const [brandColor, setBrandColor] = useState('#6CA3F6');
  const [storePath, setStorePath] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaImage, setMetaImage] = useState('');
  const [columnLayout, setColumnLayout] = useState<'single' | 'double'>('single');
  const [sensitiveWarning, setSensitiveWarning] = useState(false);
  const [facebookPixel, setFacebookPixel] = useState('');
  const [facebookToken, setFacebookToken] = useState('');
  const [googleAnalytics, setGoogleAnalytics] = useState('');
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [footerPosition, setFooterPosition] = useState<'scroll' | 'fixed'>('scroll');
  const seoImageInputRef = useRef<HTMLInputElement>(null);

  // Fetch store link, desktop view, sensitive content warning, footer position from profile/layout
  const profile = meLinkPageData?.profile;
  const layout = meLinkPageData?.layout;
  useEffect(() => {
    if (profile?.username) setStorePath(profile.username);
    else if (profileSlug) setStorePath(profileSlug);
  }, [profile?.username, profileSlug]);
  useEffect(() => {
    if (layout?.layout_mode) setColumnLayout(layout.layout_mode);
  }, [layout?.layout_mode]);
  useEffect(() => {
    if (typeof layout?.sensitive_content_warning === 'boolean') setSensitiveWarning(layout.sensitive_content_warning);
  }, [layout?.sensitive_content_warning]);
  useEffect(() => {
    const fp = layout?.footer_position;
    if (fp === 'stick_on_scroll' || fp === 'scroll') setFooterPosition('scroll');
    else if (fp === 'fixed_to_bottom' || fp === 'fixed') setFooterPosition('fixed');
  }, [layout?.footer_position]);

  // SEO custom meta (seo_title, seo_description, seo_image) from profile
  useEffect(() => {
    if (profile?.seo_title != null) setMetaTitle(profile.seo_title);
    if (profile?.seo_description != null) setMetaDescription(profile.seo_description);
    if (profile?.seo_image != null) setMetaImage(profile.seo_image);
  }, [profile?.seo_title, profile?.seo_description, profile?.seo_image]);

  const persistLayout = useCallback(
    async (patch: { layout_mode?: 'single' | 'double'; sensitive_content_warning?: boolean; footer_position?: 'scroll' | 'fixed' }) => {
      if (!token || !profileId) return;
      const result = await updateProfile(token, profileId, { layout: patch });
      if (result.success) void refetchMeLinkPage();
    },
    [token, profileId, refetchMeLinkPage],
  );

  const persistSeo = useCallback(
    async (overrides?: { seo_title?: string; seo_description?: string; seo_image?: string }) => {
      if (!token || !profileId) return;
      const result = await updateProfile(token, profileId, {
        profile: {
          seo_title: (overrides?.seo_title ?? metaTitle).trim() || undefined,
          seo_description: (overrides?.seo_description ?? metaDescription).trim() || undefined,
          seo_image: (overrides?.seo_image ?? metaImage).trim() || undefined,
        },
      });
      if (result.success) void refetchMeLinkPage();
    },
    [token, profileId, metaTitle, metaDescription, metaImage, refetchMeLinkPage],
  );
 
  return (
    <div className="space-y-6 lg:space-y-8">
       {/* Store Details */}
       <Card>
         <CardHeader>
           <CardTitle>Store Details</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 lg:py-4">
           <div className="flex items-center gap-4">
             <div className="grow">
               <Label className="text-sm">Your store's official link</Label>
               <div className="flex items-center gap-2 mt-2">
                 <div className="rounded-l-md bg-muted px-3 py-2 text-sm text-muted-foreground">{STORE_LINK_BASE}/</div>
                 <Input
                   value={storePath}
                   onChange={(e) => setStorePath(e.target.value)}
                   placeholder="your-link"
                   readOnly
                   className="bg-muted/50"
                 />
                 <Button variant="ghost" size="sm" disabled>Edit</Button>
               </div>
             </div>
             <div>
               <Label className="text-sm">Brand color</Label>
               <div className="flex items-center gap-2 mt-2">
                 <div className="h-8 w-8 rounded-md" style={{ background: brandColor }} />
                 <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-36" />
                 <Button size="sm" onClick={() => {}}>Edit</Button>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* SEO - Custom Meta (profile seo_title, seo_description, seo_image) */}
       <Card>
         <CardHeader>
           <CardTitle>SEO - Custom Meta</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 lg:py-4">
           <div className="flex items-start gap-4">
             <div>
               <Label className="text-sm">SEO preview image</Label>
               <div className="mt-2 flex flex-col gap-2">
                 {metaImage ? (
                   <img src={metaImage} alt="SEO preview" className="h-20 w-20 rounded-md border border-border object-cover" />
                 ) : (
                   <div className="h-20 w-20 rounded-md border border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">No image</div>
                 )}
                 <input
                   ref={seoImageInputRef}
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onload = () => {
                         const dataUrl = (reader.result as string) ?? '';
                         setMetaImage(dataUrl);
                         void persistSeo({ seo_image: dataUrl });
                       };
                       reader.readAsDataURL(file);
                     }
                     e.target.value = '';
                   }}
                 />
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   className="w-fit"
                   onClick={() => seoImageInputRef.current?.click()}
                 >
                   <Upload className="h-4 w-4 mr-2" />
                   Upload image
                 </Button>
                 <span className="text-xs text-muted-foreground">or paste URL below</span>
                 <Input
                   placeholder="https://..."
                   value={metaImage?.startsWith('data:') ? '' : metaImage}
                   onChange={(e) => setMetaImage(e.target.value.trim() || '')}
                   onBlur={() => persistSeo()}
                   className="w-full max-w-xs"
                 />
               </div>
             </div>
             <div className="grow space-y-3">
               <div>
                 <Label className="text-sm">Meta Title</Label>
                 <Input
                   className="mt-2"
                   placeholder="SEO title"
                   value={metaTitle}
                   onChange={(e) => setMetaTitle(e.target.value)}
                   onBlur={() => persistSeo()}
                 />
               </div>
               <div>
                 <Label className="text-sm">Meta Description</Label>
                 <Input
                   className="mt-2"
                   placeholder="SEO description"
                   value={metaDescription}
                   onChange={(e) => setMetaDescription(e.target.value)}
                   onBlur={() => persistSeo()}
                 />
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Desktop View */}
       <Card>
         <CardHeader>
           <CardTitle>Desktop View</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 lg:py-4">
           <div className="flex items-center gap-4">
             <Label className="min-w-[160px]">Column layout</Label>
             <div className="grow">
               <Select
                 value={columnLayout}
                 onValueChange={(v) => {
                   const value = v as 'single' | 'double';
                   setColumnLayout(value);
                   void persistLayout({ layout_mode: value });
                 }}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="single">Single column</SelectItem>
                   <SelectItem value="double">Double column</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Sensitive Content Warning */}
       <Card>
         <CardHeader>
           <CardTitle>Sensitive Content Warning</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 lg:py-4">
           <div className="flex items-center justify-between">
             <div>
               <Label className="text-sm">Show content warning before your store opens</Label>
               <div className="text-sm text-muted-foreground mt-1">Show a warning before visitors see sensitive content</div>
             </div>
             <div className="flex items-center gap-3">
               <Switch
                 checked={sensitiveWarning}
                 onCheckedChange={(v) => {
                   const value = !!v;
                   setSensitiveWarning(value);
                   void persistLayout({ sensitive_content_warning: value });
                 }}
               />
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Analytics integration */}
       <Card>
         <CardHeader>
           <CardTitle>Analytics integration</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 lg:py-4">
           <div>
             <Label className="text-sm">Facebook Tracking</Label>
             <Input placeholder="Pixel ID" className="mt-2" value={facebookPixel} onChange={(e) => setFacebookPixel(e.target.value)} />
             <Input placeholder="Pixel Conversions API Access Token" className="mt-2" value={facebookToken} onChange={(e) => setFacebookToken(e.target.value)} />
           </div>
           <div>
             <Label className="text-sm">Google Tracking</Label>
             <Input placeholder="Google Analytics ID" className="mt-2" value={googleAnalytics} onChange={(e) => setGoogleAnalytics(e.target.value)} />
           </div>
         </CardContent>
       </Card>
 
       {/* Certificates & Licenses */}
       <Card>
         <CardHeader>
           <CardTitle>Certificates & Licenses</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 lg:py-4">
           <div className="text-sm text-muted-foreground">Showcasing your official certificates/licenses builds trust in your customers and leads to higher sales.</div>
           <Button variant="link" onClick={() => setCertDialogOpen(true)}>+ Add New</Button>
         </CardContent>
       </Card>
 
       {/* Hide SuperProfile Referral Link */}
       <Card>
         <CardHeader>
           <CardTitle>Hide SuperProfile Referral Link</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-4 lg:py-4">
           <div className="flex items-center gap-4">
             <Label className="min-w-[160px]">Footer position</Label>
             <div className="grow">
               <Select
                 value={footerPosition}
                 onValueChange={(v) => {
                   const value = v as 'scroll' | 'fixed';
                   setFooterPosition(value);
                   void persistLayout({ footer_position: value });
                 }}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="scroll">Sticks on scroll</SelectItem>
                   <SelectItem value="fixed">Fixed to bottom</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Certificate dialog */}
       <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
         <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle>New certificate/license</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label className="text-sm">Certificate title *</Label>
               <Input className="mt-2" />
             </div>
             <div>
               <Label className="text-sm">Issuing organisation *</Label>
               <Input className="mt-2" />
             </div>
             <div className="grid grid-cols-2 gap-2">
               <div>
                 <Label className="text-sm">Issue month *</Label>
                 <Select>
                   <SelectTrigger>
                     <SelectValue placeholder="Select month" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="1">January</SelectItem>
                     <SelectItem value="2">February</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label className="text-sm">Issue year *</Label>
                 <Select>
                   <SelectTrigger>
                     <SelectValue placeholder="Select year" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="2026">2026</SelectItem>
                     <SelectItem value="2025">2025</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <div>
               <Label className="text-sm">Certificate/License ID *</Label>
               <Input className="mt-2" />
             </div>
             <div>
               <Label className="text-sm">Upload or add a link to your certificate/license</Label>
               <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                 <Upload className="mx-auto mb-2" />
                 <div className="text-sm text-muted-foreground">Upload certificate/license copy (JPEG, PNG, or PDF. Max size: 50MB)</div>
                 <div className="mt-3">
                   <Button variant="outline">Upload certificate/license copy</Button>
                 </div>
               </div>
             </div>
             <div className="pt-2">
               <Button className="w-full">Add certificate/license</Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
    </div>
   );
 }

