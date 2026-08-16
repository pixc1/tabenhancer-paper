# TabEnhancer

بلوقن مستقل لخوادم **Paper** يحسن شكل قائمة اللاعبين داخل TAB. يعرض Header وFooter باللغة الإنجليزية، وبادئات ملونة حسب وضع اللعب، وخانة واضحة لعرض Ping بجانب اسم كل لاعب. يعمل بملف JAR واحد مبني على API قديمة مشتركة وJava 8-compatible.

## المزايا

يعرض البلوقن Header وFooter مخصصين لكل لاعب، ويستبدل المتغيرات تلقائيًا باسم اللاعب وعدد اللاعبين الحالي والحد الأقصى ووضع اللعب وPing. كما يضيف بادئة ملونة بجانب اسم كل لاعب في TAB حسب وضعه: `SURVIVAL` أو `CREATIVE` أو `ADVENTURE` أو `SPECTATOR`، ويعرض بجانب الاسم صيغة مثل `Ping: 42ms` عند تفعيل الخيار.

يتم تحديث القائمة تلقائيًا عند دخول اللاعبين وخروجهم وتغيير العالم وتغيير وضع اللعب. يوجد أيضًا أمر لإعادة تحميل الإعدادات دون إعادة تشغيل الخادم.

> البلوقن لا يحتاج إلى أي مكتبات خارجية وقت التشغيل، ولا يغير أسماء اللاعبين داخل العالم؛ التغيير يخص قائمة TAB فقط.

## التثبيت

1. نزّل ملف `tab-enhancer-1.1.0.jar`.
2. انسخه إلى مجلد `plugins` داخل خادم Paper.
3. أعد تشغيل الخادم بالكامل.
4. ستجد الإعدادات في `plugins/TabEnhancer/config.yml`.
5. عدّل الإعدادات ثم نفّذ `/tabreload` لتطبيقها مباشرة.

## الأمر والصلاحية

| الأمر | الوظيفة | الصلاحية |
|---|---|---|
| `/tabreload` | إعادة تحميل `config.yml` وتحديث TAB | `tabenhancer.admin`، والافتراضي OP |

## المتغيرات المتاحة

يمكن استخدام المتغيرات التالية في سطور Header وFooter:

| المتغير | النتيجة |
|---|---|
| `%player%` | اسم اللاعب الذي يرى القائمة |
| `%online%` | عدد اللاعبين المتصلين حاليًا |
| `%max%` | الحد الأقصى للاعبين |
| `%gamemode%` | وضع لعب اللاعب الذي يرى القائمة |
| `%ping%` | Ping اللاعب بالميلي ثانية، أو `-` إذا لم يدعم الخادم قراءته |

تستخدم الألوان بصيغة Bukkit القديمة، مثل `&b` للأزرق الفاتح و`&7` للرمادي و`&l` للخط العريض.

## الإعدادات الأساسية

```yaml
settings:
  update-interval-ticks: 20
  show-status-prefix: true
  show-ping: true
  show-header-footer: true
```

كل 20 Tick تساوي تقريبًا ثانية واحدة. يمكن تغييرها إلى `40` لتحديث القائمة كل ثانيتين وتقليل التحديثات.

لتعطيل البادئات بجانب أسماء اللاعبين، اجعل `show-status-prefix` مساويًا لـ `false`. ولتعطيل خانة Ping، اجعل `show-ping` مساويًا لـ `false`. ولتعطيل Header وFooter، اجعل `show-header-footer` مساويًا لـ `false`.

## مثال العرض

```text
TEST SERVER
Welcome, Player
Players: 3/20
Your mode: Survival | Your ping: 42ms

[SURVIVAL] Player | Ping: 42ms
```

## تخصيص البادئات

يمكن تغيير النص والألوان من قسم `prefixes`:

```yaml
prefixes:
  survival: "&8[&aSURVIVAL&8] &f"
  creative: "&8[&dCREATIVE&8] &f"
  adventure: "&8[&eADVENTURE&8] &f"
  spectator: "&8[&bSPECTATOR&8] &f"
  unknown: "&8[&7PLAYER&8] &f"
```

## التوافق

الإصدار `v1.1.0` مبني على Java 8 bytecode باستخدام PaperSpigot API التاريخية 1.8.8 وواجهات Bukkit المشتركة. لذلك يستهدف ملف JAR واحدًا لخوادم Paper من **1.8.8 إلى 1.21.x**، بما في ذلك Paper 1.16.5 و1.20 و1.21.11.

تم اختبار البناء على API 1.8.8، وتم اختبار تحميل وتشغيل النسخة على Paper 1.21.11. لا يمكن ضمان كل إصدار فرعي منفصل دون اختباره، ولا يُنصح باستخدامه على إصدارات أقدم من 1.8.8 دون إصدار خاص.

## بناء المشروع من المصدر

```bash
mvn clean package
```

سيتم إنشاء الملف التالي:

```text
target/tab-enhancer-1.1.0.jar
```

يمكن التحقق من توافق Java للملف الناتج عبر:

```bash
javap -verbose -classpath target/tab-enhancer-1.1.0.jar com.example.tabenhancer.TabEnhancerPlugin | grep "major version"
```

ويجب أن تكون النتيجة `major version: 52`، وهي Java 8 bytecode.

## سجل التشغيل المتوقع

عند الإقلاع يجب أن يظهر ما يشبه:

```text
[TabEnhancer] Loading server plugin TabEnhancer v1.1.0
[TabEnhancer] Enabling TabEnhancer v1.1.0
[TabEnhancer] TabEnhancer enabled for Paper 1.8.8 and newer.
```

## ملاحظات مهمة

قد لا تكون قراءة Ping متاحة بنفس الطريقة في بعض الخوادم القديمة أو البرمجيات المعدلة. في هذه الحالة سيظهر `-` بدل الرقم، بينما تبقى بقية وظائف TAB وHeader وFooter وبادئات الأوضاع فعالة.
