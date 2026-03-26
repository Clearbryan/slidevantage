import mongoose from 'mongoose'

function reg<T>(name: string, schema: mongoose.Schema): mongoose.Model<T> {
  try { return mongoose.model<T>(name) }
  catch { return mongoose.model<T>(name, schema) }
}

const S = mongoose.Schema
const OID = S.Types.ObjectId

// Admin
const AdminSchema = new S({ name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, passwordHash:{type:String,required:true}, role:{type:String,enum:['admin','super_admin'],default:'admin'}, lastLogin:{type:Date}, resetToken:{type:String,default:null}, resetTokenExpires:{type:Date,default:null} }, {timestamps:true})

// User
const UserSchema = new S({ name:{type:String,required:true,trim:true}, surname:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, passwordHash:{type:String}, googleId:{type:String,sparse:true}, role:{type:String,enum:['subscriber','free'],default:'free'}, country:{type:String}, phone:{type:String}, avatarUrl:{type:String}, subscription:{type:OID,ref:'Subscription'}, teamAccount:{type:OID,ref:'TeamAccount'}, favourites:[{type:OID,ref:'Template'}], recentlyViewed:[{type:OID,ref:'Template'}], totalDownloads:{type:Number,default:0}, isActive:{type:Boolean,default:true}, emailVerified:{type:Boolean,default:false}, resetToken:{type:String,default:null}, resetTokenExpires:{type:Date,default:null} }, {timestamps:true})

// Category
const CategorySchema = new S({ name:{type:String,required:true,trim:true}, slug:{type:String,required:true,unique:true,lowercase:true}, description:{type:String,trim:true}, icon:{type:String}, order:{type:Number,default:0}, templateCount:{type:Number,default:0}, isActive:{type:Boolean,default:true} }, {timestamps:true})

// Template
const TemplateSchema = new S({ title:{type:String,required:true,trim:true}, description:{type:String,required:true,trim:true}, category:{type:OID,ref:'Category',required:true}, format:[{type:String,enum:['powerpoint','google_slides','keynote','canva']}], tier:{type:String,enum:['free','premium'],default:'free'}, tags:[{type:String,trim:true}], thumbnailUrl:{type:String,default:''}, fileUrls:{type:Map,of:String,default:{}}, previewImages:[{type:String}], downloadCount:{type:Number,default:0}, viewCount:{type:Number,default:0}, isFeatured:{type:Boolean,default:false}, status:{type:String,enum:['draft','published','archived'],default:'draft'}, slideCount:{type:Number} }, {timestamps:true})

TemplateSchema.post('save', async function() {
  try {
    const Cat = mongoose.connection.model('Category')
    const n = await mongoose.connection.model('Template').countDocuments({category:this.category,status:'published'})
    await Cat.findByIdAndUpdate(this.category, {templateCount:n})
  } catch {}
})
TemplateSchema.post('findOneAndDelete', async function(doc) {
  if (!doc) return
  try {
    const Cat = mongoose.connection.model('Category')
    const n = await mongoose.connection.model('Template').countDocuments({category:doc.category,status:'published'})
    await Cat.findByIdAndUpdate(doc.category, {templateCount:n})
  } catch {}
})

// Plan
const PlanSchema = new S({ name:{type:String,required:true,trim:true}, type:{type:String,enum:['individual','team_10','team_20'],required:true}, interval:{type:String,enum:['monthly','annual'],required:true}, priceUSD:{type:Number,required:true,min:0}, priceZWL:{type:Number,required:true,min:0}, features:[{type:String}], maxUsers:{type:Number,default:1}, maxDownloadsPerMonth:{type:Number,default:null}, isActive:{type:Boolean,default:true}, stripePriceId:{type:String} }, {timestamps:true})

// Subscription
const SubscriptionSchema = new S({ user:{type:OID,ref:'User'}, teamAccount:{type:OID,ref:'TeamAccount'}, plan:{type:OID,ref:'Plan',required:true}, status:{type:String,enum:['active','cancelled','expired','trialing'],default:'active'}, paymentProvider:{type:String,enum:['stripe','ecocash'],required:true}, priceAtPurchase:{type:Number,required:true}, currency:{type:String,default:'USD'}, promoCode:{type:OID,ref:'PromoCode'}, discountApplied:{type:Number}, currentPeriodStart:{type:Date,required:true}, currentPeriodEnd:{type:Date,required:true}, cancelledAt:{type:Date}, stripeSubscriptionId:{type:String} }, {timestamps:true})

// PromoCode
const PromoCodeSchema = new S({ code:{type:String,required:true,unique:true,uppercase:true,trim:true}, discountType:{type:String,enum:['percentage','fixed'],required:true}, discountValue:{type:Number,required:true,min:0}, applicablePlans:[{type:OID,ref:'Plan'}], usageLimit:{type:Number,default:null}, usedCount:{type:Number,default:0}, expiresAt:{type:Date}, isActive:{type:Boolean,default:true} }, {timestamps:true})

// Banner
const BannerSchema = new S({ title:{type:String,required:true,trim:true}, subtitle:{type:String,trim:true}, imageUrl:{type:String,required:true}, linkUrl:{type:String}, isActive:{type:Boolean,default:true}, order:{type:Number,default:0}, startsAt:{type:Date}, endsAt:{type:Date} }, {timestamps:true})

// Download
const DownloadSchema = new S({ user:{type:OID,ref:'User',required:true}, template:{type:OID,ref:'Template',required:true}, format:{type:String,default:''}, downloadedAt:{type:Date,default:Date.now} })

// Payment
const PaymentSchema = new S({ user:{type:OID,ref:'User',required:true}, subscription:{type:OID,ref:'Subscription'}, amount:{type:Number,required:true}, currency:{type:String,default:'USD'}, provider:{type:String,enum:['stripe','ecocash'],required:true}, status:{type:String,enum:['succeeded','failed','refunded','pending'],default:'pending'}, description:{type:String}, stripePaymentId:{type:String} }, {timestamps:true})

// TeamAccount
const TeamAccountSchema = new S({ name:{type:String,required:true,trim:true}, owner:{type:OID,ref:'User',required:true}, members:[{type:OID,ref:'User'}], maxMembers:{type:Number,required:true}, subscription:{type:OID,ref:'Subscription'} }, {timestamps:true})

export const Admin        = reg<any>('Admin',        AdminSchema)
export const User         = reg<any>('User',         UserSchema)
export const Category     = reg<any>('Category',     CategorySchema)
export const Template     = reg<any>('Template',     TemplateSchema)
export const Plan         = reg<any>('Plan',         PlanSchema)
export const Subscription = reg<any>('Subscription', SubscriptionSchema)
export const PromoCode    = reg<any>('PromoCode',    PromoCodeSchema)
export const Banner       = reg<any>('Banner',       BannerSchema)
export const Download     = reg<any>('Download',     DownloadSchema)
export const Payment      = reg<any>('Payment',      PaymentSchema)
export const TeamAccount  = reg<any>('TeamAccount',  TeamAccountSchema)
