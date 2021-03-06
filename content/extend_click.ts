import {
  clickable_, setupEventListener, VOther, timeout_, clearTimeout_, doc, isAlive_, set_allowRAF_, set_allowScripts_,
  loc_, replaceBrokenTimerFunc, allowRAF_, getTime, recordLog, VTr,
} from "../lib/utils"
import {
  createElement_, set_createElement_, OnDocLoaded_, runJS_, isHTML_, rAF_, CLK, MDW,
} from "../lib/dom_utils"
import { Stop_ } from "../lib/keyboard_utils"
import { safeDestroy } from "./port"
import { allHints, hintKeyStatus, coreHints } from "./link_hints"
import { grabBackFocus } from "./mode_insert"

declare function exportFunction(this: void, func: (...args: any[]) => any, targetScope: object, options?: {
  defineAs: string;
  allowCrossOriginArguments?: boolean;
}): void;

export const main = (): void => {
!(Build.BTypes & BrowserType.Firefox)
|| Build.BTypes & ~BrowserType.Firefox && VOther !== BrowserType.Firefox
?
(function extendClick(this: void, isFirstTime?: boolean): void | false {
/** Note(gdh1995):
 * According to source code of C72,
 *     getElementsByTagName has a special cache (per container node) for tag name queries,
 * and I think it's shared across V8 worlds.
 * https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/dom/container_node.cc?type=cs&q=getElementsByTagName&g=0&l=1578
 */
  const enum InnerConsts {
    MaxElementsInOneTickDebug = 1024,
    MaxElementsInOneTickRelease = 512,
    MaxUnsafeEventsInOneTick = 12,
    DelayToWaitDomReady = 1000,
    DelayForNext = 36,
    DelayForNextComplicatedCase = 1,
    TimeoutOf3rdPartyFunctionsCache = 1e4, // 10 seconds
    kSecretAttr = "data-vimium",

    kVOnClick = "VimiumCClickable",
    kHook = "VimiumC",
    kCmd = "VC",
  }
  type ClickableEventDetail = [ /** inDocument */ number[], /** forDetached */ number[]
          , /** fromAttrs */ BOOL ] | string;
/** Note: on Firefox, a `[sec, cmd]` can not be visited by the main world:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#Constructors_from_the_page_context.
 */
  // `high bits` mean secret, `lower bits >> kContentCmd.MaskedBitNumber` mean content cmd
  type CommandEventDetail = number;
  interface VimiumCustomEventCls {
    prototype: CustomEvent;
    new <Type extends InnerConsts & string>(typeArg: Type, eventInitDict?: { detail?:
      Type extends InnerConsts.kVOnClick ? ClickableEventDetail
        : Type extends InnerConsts.kCmd ? CommandEventDetail
        : never;
      composed?: boolean; }): CustomEvent;
  }
  interface VimiumDelegateEventCls {
    prototype: FocusEvent;
    new (typeArg: InnerConsts.kVOnClick | InnerConsts.kHook
        , eventInitDict: Pick<FocusEventInit, "relatedTarget" | "composed">): FocusEvent;
  }

  const kVOnClick1 = InnerConsts.kVOnClick
    , kHookRand = (InnerConsts.kHook + BuildStr.RandomClick) as InnerConsts.kHook
    , appInfo = Build.BTypes & BrowserType.Chrome
        && (Build.MinCVer <= BrowserVer.NoRAFOrRICOnSandboxedPage
            || Build.MinCVer < BrowserVer.MinEnsuredNewScriptsFromExtensionOnSandboxedPage
            || Build.MinCVer < BrowserVer.MinEnsuredES6MethodFunction
            || Build.MinCVer < BrowserVer.MinEventListenersFromExtensionOnSandboxedPage)
        && (!(Build.BTypes & ~BrowserType.ChromeOrFirefox) || VOther === BrowserType.Chrome)
        ? navigator.appVersion.match(<RegExpSearchable<1>> /\bChrom(?:e|ium)\/(\d+)/) : 0 as const
    , appVer: BrowserVer | 1 | 0 = Build.BTypes & BrowserType.Chrome
        && (Build.MinCVer <= BrowserVer.NoRAFOrRICOnSandboxedPage
            || Build.MinCVer < BrowserVer.MinEnsuredNewScriptsFromExtensionOnSandboxedPage
            || Build.MinCVer < BrowserVer.MinEnsuredES6MethodFunction
            || Build.MinCVer < BrowserVer.MinEventListenersFromExtensionOnSandboxedPage)
        ? appInfo && <BrowserVer> +appInfo[1] || 0
        : Build.BTypes & BrowserType.Chrome
          && (!(Build.BTypes & ~BrowserType.ChromeOrFirefox) || VOther === BrowserType.Chrome)
        ? 1 : 0
    , docEl = doc.documentElement
    , secret: number = (Math.random() * kContentCmd.SecretRange + 1) | 0
    , script = createElement_("script");
/**
 * Note:
 *   should not create HTML/SVG elements before document gets ready,
 *   otherwise the default XML parser will not enter a "xml_viewer_mode"
 * Stack trace:
 * * https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/xml/parser/xml_document_parser.cc?q=XMLDocumentParser::end&l=390
 * * https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/xml/parser/xml_document_parser.cc?q=XMLDocumentParser::DoEnd&l=1543
 * * https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/xml/parser/xml_document_parser.cc?g=0&q=HasNoStyleInformation&l=106
 * * https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/dom/document.cc?g=0&q=Document::CreateRawElement&l=946
 * Vimium issue: https://github.com/philc/vimium/pull/1797#issuecomment-135761835
 */
  if ((script as Element as ElementToHTML).lang == null) {
    set_createElement_(doc.createElementNS.bind(doc, "http://www.w3.org/1999/xhtml") as typeof createElement_)
    return isFirstTime != null && OnDocLoaded_(extendClick); // retry after a while, using a real <script>
  }

  let box: Element | undefined | 0, hookRetryTimes = 0,
  isFirstResolve: 0 | 1 | 2 | 3 | 4 = window === top ? 3 : 4,
  hook = function (event: Event): void {
    const t = (event as TypeToAssert<Event, VimiumDelegateEventCls["prototype"], "relatedTarget">).relatedTarget,
    S = InnerConsts.kSecretAttr;
    // use `instanceof` to require the `t` element is a new instance which has never entered this extension world
    if (++hookRetryTimes > GlobalConsts.MaxRetryTimesForSecret
        || !(t instanceof Element)) { return; }
    Stop_(event);
    if (t.localName !== "div" || t.getAttribute(S) !== "" + secret) { return; }
    setupEventListener(0, kHookRand, hook, 1);
    hook = null as never;
    if (box == null) {
      t.removeAttribute(S);
      setupEventListener(t, kVOnClick1, onClick);
      box = t;
    }
  };
  function onClick(this: Element | Window, event: Event): void {
    if (!box) { return; }
    Stop_(event);
    const rawDetail = (
        event as TypeToAssert<Event, (VimiumCustomEventCls | VimiumDelegateEventCls)["prototype"], "detail">
        ).detail as ClickableEventDetail | null | undefined,
    isSafe = this === box,
    detail = rawDetail && typeof rawDetail === "object" && isSafe ? rawDetail : "",
    fromAttrs: 0 | 1 | 2 = detail ? (detail[2] + 1) as 1 | 2 : 0;
    let path: typeof event.path,
    target = detail ? null : (event as VimiumDelegateEventCls["prototype"]).relatedTarget as Element | null
        || (!(Build.BTypes & BrowserType.Edge)
            && Build.MinCVer >= BrowserVer.Min$Event$$Path$IncludeWindowAndElementsIfListenedOnWindow
          ? event.path![0] as Element
          : (path = event.path) && path.length > 1 ? path[0] as Element : null);
    if (detail) {
      resolve(0, detail[0]); resolve(1, detail[1]);
    } else if (/* safer */ target && (isSafe && !rawDetail || secret + "" + target.tagName === rawDetail)) {
      clickable_.add(target);
    } else {
      if (!Build.NDEBUG && !isSafe && target && secret + "" + target.tagName !== rawDetail) {
        console.error("extend click: unexpected: detail =", rawDetail, target);
        return;
      }
    }
    if (!Build.NDEBUG) {
      console.log(`Vimium C: extend click: resolve ${detail ? "[%o + %o]" : "<%o>%s"} in %o @t=%o .`
        , detail ? detail[0].length
          : target && (typeof target.localName !== "string" ? target + "" : target.localName)
        , detail ? detail[2] ? -0 : detail[1].length
          : (event as FocusEvent).relatedTarget ? " (detached)"
          : this === window ? " (path on window)" : " (path on box)"
        , loc_.pathname.replace(<RegExpOne> /^.*(\/[^\/;]+\/?)(;[^\/]+)?$/, "$1")
        , getTime() % 3600000);
    }
    if (isFirstResolve & fromAttrs) {
      isFirstResolve ^= fromAttrs;
      allHints && !hintKeyStatus.k && !hintKeyStatus.t && timeout_(coreHints.x, 34);
    }
  }
  function resolve(isBox: BOOL, nodeIndexList: number[]): void {
    if (!nodeIndexList.length) { return; }
    const list = (isBox ? box as Element : doc).getElementsByTagName("*");
    for (const index of nodeIndexList) {
      let el = list[index];
      el && clickable_.add(el);
    }
  }
  function dispatchCmd(cmd: SecondLevelContentCmds): void {
    box && box.dispatchEvent(new (CustomEvent as VimiumCustomEventCls)(
        InnerConsts.kCmd, {
      detail: (secret << kContentCmd.MaskedBitNumber) | cmd
    }));
  }
  function execute(cmd: ValidContentCommands): void {
    if (cmd < kContentCmd._minSuppressClickable) {
      isFirstResolve = 0;
      dispatchCmd(cmd as ValidContentCommands & ContentCommandsNotSuppress);
      return;
    }
    /** this function should keep idempotent */
    if (box) {
      setupEventListener(box, kVOnClick1, onClick, 1);
      setupEventListener(0, kVOnClick1, onClick, 1);
      dispatchCmd(kContentCmd.Destroy);
    }
    if (box == null && isFirstTime) {
      setupEventListener(0, kHookRand, hook, 1);
      if (cmd === kContentCmd.DestroyForCSP) {
        // normally, if here, must have: limited by CSP; not C or C >= MinEnsuredNewScriptsFromExtensionOnSandboxedPage
        // ignore the rare (unexpected) case that injected code breaks even when not limited by CSP,
        //     which might mean curCVer has no ES6...
        runJS_("`${Vimium" + secret + "=>9}`");
      }
    }
    box = 0;
    VApi.e = null;
  }

// #region injected code

  /** the `InnerVerifier` needs to satisfy
   * * never return any object (aka. keep void) if only "not absolutely safe"
   * * never change the global environment / break this closure
   * * must look like a real task and contain random string
   */
  interface InnerVerifier {
    (maybeSecret: string, maybeAnotherVerifierInner: InnerVerifier | unknown): void;
    (maybeSecret: string): [EventTarget["addEventListener"], Function["toString"]] | void;
  }
  type PublicFunction = (maybeKNeedToVerify: string, verifierFunc: InnerVerifier | unknown) => void | string;
  let injected: string = (Build.NDEBUG ? VTr(isFirstTime ? kTip.extendClick : kTip.removeCurScript)
          : !isFirstTime && VTr(kTip.removeCurScript))
        || '"use strict";(' + (function VC(this: void): void {

function verifier(maybeSecret: string, maybeVerifierB?: InnerVerifier): ReturnType<InnerVerifier> {
  if (maybeSecret === GlobalConsts.MarkAcrossJSWorlds
      && noAbnormalVerifyingFound) {
    if (!maybeVerifierB) {
      return [myAEL, myToStr];
    } else {
      [anotherAEL, anotherToStr] = maybeVerifierB(decryptFromVerifier(maybeVerifierB))!;
    }
  } else {
    noAbnormalVerifyingFound = 0;
  }
}
type FUNC = (this: unknown, ...args: never[]) => unknown;
const doc0 = document, curScript = doc0.currentScript as HTMLScriptElement,
sec: number = +curScript.dataset.vimium!,
ETP = EventTarget.prototype, _listen = ETP.addEventListener,
toRegister: Element[] & { p (el: Element): void | 1; s: Element[]["splice"] } = [] as any,
_apply = _listen.apply, _call = _listen.call,
call = _call.bind(_call as any) as <T, A extends any[], R>(func: (this: T, ...a: A) => R, thisArg: T, ...args: A) => R,
dispatch = _call.bind<(this: (this: EventTarget, ev: Event) => boolean
    , self: EventTarget, evt: Event) => boolean>(ETP.dispatchEvent),
ElCls = Element, ElProto = ElCls.prototype, Append = ElProto.appendChild,
GetRootNode = ElProto.getRootNode,
Attr = ElProto.setAttribute, HasAttr = ElProto.hasAttribute, Remove = ElProto.remove,
StopProp = Event.prototype.stopImmediatePropagation as (this: Event) => void,
contains = ElProto.contains.bind(doc0), // in fact, it is Node.prototype.contains
nodeIndexListInDocument: number[] = [], nodeIndexListForDetached: number[] = [],
getElementsByTagNameInDoc = doc0.getElementsByTagName, getElementsByTagNameInEP = ElProto.getElementsByTagName,
IndexOf = _call.bind(toRegister.indexOf) as never as (list: HTMLCollectionOf<Element>, item: Element) => number,
push = nodeIndexListInDocument.push,
pushInDocument = push.bind(nodeIndexListInDocument), pushForDetached = push.bind(nodeIndexListForDetached),
CECls = CustomEvent as VimiumCustomEventCls,
DECls = FocusEvent as VimiumDelegateEventCls,
FProto = Function.prototype, _toString = FProto.toString,
listen = _call.bind<(this: (this: EventTarget,
          type: string, listener: EventListenerOrEventListenerObject, useCapture?: EventListenerOptions | boolean
        ) => 42 | void,
        self: EventTarget, name: string, listener: EventListenerOrEventListenerObject,
        opts?: EventListenerOptions | boolean
    ) => 42 | void>(_listen),
rEL = removeEventListener, clearTimeout1 = clearTimeout,
kVOnClick = InnerConsts.kVOnClick,
kEventName2 = kVOnClick + BuildStr.RandomClick,
kOnDomReady = "readystatechange", kFunc = "function",
StringIndexOf = kOnDomReady.indexOf, StringSubstr = kOnDomReady.substr,
decryptFromVerifier = (func: InnerVerifier | unknown): string => {
  const str = call(_toString, func as InnerVerifier), offset = call(StringIndexOf, str, kMarkToVerify);
  return call(StringSubstr, str, offset
      , GlobalConsts.LengthOfMarkAcrossJSWorlds + GlobalConsts.SecretStringLength);
},
newFuncToString = function (a: FUNC, args: IArguments): string {
    const replaced = a === myAEL || a === anotherAEL ? _listen
        : a === myToStr || a === anotherToStr ? _toString
        : 0,
    str = call(_apply as (this: (this: FUNC, ...args: any[]) => string, self: FUNC, args: IArguments) => string,
              _toString, replaced || a, args);
    detectDisabled && str === detectDisabled && executeCmd();
    return replaced || str !== (myAELStr || (myAELStr = call(_toString as (this: Function, ...args: any[]) => string
              , myAEL, myToStrStr = call(_toString, myToStr)))
            ) && str !== myToStrStr ? str
        : (
          noAbnormalVerifyingFound && (a as PublicFunction)(kMarkToVerify, verifier),
          a === anotherAEL ? call(_toString, _listen) : a === anotherToStr ? call(_toString, _toString)
          : (noAbnormalVerifyingFound = 0, str)
        );
},
hooks = {
  // the code below must include direct reference to at least one property in `hooks`
  // so that uglifyJS / terse won't remove the `hooks` variable
  /** Create */ c: doc0.createElement,
  toString: function toString(this: FUNC): string {
    const args = arguments;
    if (args.length === 2 && args[0] === kMarkToVerify) {
      // randomize the body of this function
      (args[1] as InnerVerifier)(decryptFromVerifier(args[1]), verifier);
    }
    return newFuncToString(this, args);
  },
  addEventListener: function addEventListener(this: EventTarget, type: string
      , listener: EventListenerOrEventListenerObject): void {
    const a = this, args = arguments, len = args.length;
    if (type === kMarkToVerify) {
      (listener as any as InnerVerifier)(decryptFromVerifier(listener), verifier);
      return;
    }
    len === 2 ? listen(a, type, listener) : len === 3 ? listen(a, type, listener, args[2])
      : call(_apply as (this: (this: EventTarget, ...args: any[]) => void
                        , self: EventTarget, args: IArguments) => void,
             _listen as (this: EventTarget, ...args: any[]) => void, a, args);
    if (type === "click" || type === "mousedown" || type === "dblclick"
        ? listener && a instanceof ElCls && a.tagName !== "a"
        : type === kEventName2 && !isReRegistering
          // note: window.history is mutable on C35, so only these can be used: top,window,location,document
          && a && !(a as Window).window && (a as Node).nodeType === kNode.ELEMENT_NODE) {
      toRegister.p(a as Element);
      timer = timer || (queueMicroTask_(delayToStartIteration), 1);
    }
    // returns void: https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/dom/events/event_target.idl
  }
},
noop = (): 1 => 1,
myAEL = hooks.addEventListener, myToStr = hooks.toString;

let doInit = function (this: void): void {
  rEL(kOnDomReady, doInit, !0);
  clearTimeout1(timer);
  detectDisabled = 0;
  const docEl2 = docChildren[0] as Element | null,
  el = call(hooks.c, doc0, "div") as HTMLDivElement,
  S = InnerConsts.kSecretAttr;
  doInit = docChildren = null as never;
  if (!docEl2) { return executeCmd(); }
  call(Attr, el, S, "" + sec);
  listen(el, InnerConsts.kCmd, executeCmd, !0);
  dispatch(window, new DECls((InnerConsts.kHook + BuildStr.RandomClick) as InnerConsts.kHook, {relatedTarget: el}));
  if (call(HasAttr, el, S)) {
    executeCmd();
  } else {
    root = el;
    timer = toRegister.length > 0 ? setTimeout_(next, InnerConsts.DelayForNext) : 0;
  }
},
kMarkToVerify = GlobalConsts.MarkAcrossJSWorlds as const,
myAELStr: string | undefined, myToStrStr: string | undefined,
detectDisabled: string | 0 = `Vimium${sec}=>9`,
noAbnormalVerifyingFound: BOOL = 1,
anotherAEL: typeof myAEL | undefined | 0, anotherToStr: typeof myToStr | undefined | 0,
// here `setTimeout` is normal and will not use TimerType.fake
setTimeout_ = setTimeout as SafeSetTimeout,
docChildren = doc0.children,
unsafeDispatchCounter = 0,
allNodesInDocument = null as HTMLCollectionOf<Element> | null,
allNodesForDetached = null as HTMLCollectionOf<Element> | null,
isReRegistering: BOOL | boolean = 0,
// To avoid a host script detect Vimum C by code like:
// ` a1 = setTimeout(()=>{}); $0.addEventListener('click', ()=>{}); a2=setTimeout(()=>{}); [a1, a2] `
delayToStartIteration = (): void => { setTimeout_(next, GlobalConsts.ExtendClick_DelayToStartIteration); },
next = function (): void {
  const len = toRegister.length,
  start = len > (Build.NDEBUG ? InnerConsts.MaxElementsInOneTickRelease : InnerConsts.MaxElementsInOneTickDebug)
    ? len - (Build.NDEBUG ? InnerConsts.MaxElementsInOneTickRelease : InnerConsts.MaxElementsInOneTickDebug) : 0,
  delta = len - start;
  timer = start > 0 ? setTimeout_(next, InnerConsts.DelayForNext) : 0;
  if (!len) { return; }
  call(Remove, root); // just safer
  // skip some nodes if only crashing, so that there would be less crash logs in console
  const slice = toRegister.s(start, delta);
  for (let i = unsafeDispatchCounter = 0; i < slice.length; i++) {
    prepareRegister(slice[i]); // avoid for-of, in case Array::[[Symbol.iterator]] was modified
  }
  doRegister(0);
  allNodesInDocument = allNodesForDetached = null;
}
, root: HTMLDivElement, timer = setTimeout_(doInit, InnerConsts.DelayToWaitDomReady)
, queueMicroTask_: (callback: () => void) => void =
    !(Build.BTypes & ~BrowserType.ChromeOrFirefox) && Build.MinCVer >= BrowserVer.Min$queueMicrotask
    ? queueMicrotask : Build.BTypes & ~BrowserType.Edge ? (window as any).queueMicrotask : 0 as unknown as any
;
if (!(Build.BTypes & ~BrowserType.Edge)
    || (Build.BTypes & ~BrowserType.ChromeOrFirefox || Build.MinCVer < BrowserVer.Min$queueMicrotask)
        && typeof queueMicroTask_ !== kFunc) {
  queueMicroTask_ = Promise.resolve() as any;
  queueMicroTask_ = (queueMicroTask_ as any as Promise<void>).then.bind(queueMicroTask_ as any as Promise<void>);
}
function prepareRegister(this: void, element: Element): void {
  if (contains(element)) {
    pushInDocument(
      IndexOf(allNodesInDocument = allNodesInDocument || call(getElementsByTagNameInDoc, doc0, "*")
        , element));
    return;
  }
  // here element is inside a #shadow-root or not connected
  const doc1 = element.ownerDocument;
  // in case element is <form> / <frameset> / adopted into another document, or aEL is from another frame
  if (doc1 !== doc0) {
    // although on Firefox element.__proto__ is auto-updated when it is adopted
    // but aEl may be called before real insertion
    if ((!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinFramesetHasNoNamedGetter
          || (doc1 as WindowWithTop).top !== top)
        && (doc1 as Exclude<typeof doc1, Window>).nodeType === kNode.DOCUMENT_NODE
        && (doc1 as Document).defaultView) {
      // just smell like a Document
      /*#__NOINLINE__*/
      safeReRegister(element, doc1 as Document);
    } // `defaultView` is to check whether element is in a DOM tree of a real frame
    // Note: on C72, ownerDocument of elements under <template>.content
    // is a fake "about:blank" document object
    return;
  }
  let parent: Node | RadioNodeList | null | undefined, tempParent: Node | RadioNodeList | null | undefined;
  if (!(Build.BTypes & BrowserType.Edge) && Build.MinCVer >= BrowserVer.Min$Node$$getRootNode || GetRootNode) {
    parent = call(GetRootNode!, element);
  } else {
    // according to tests and source code, the named getter for <frameset> requires <frame>.contentDocument is valid
    // so here pe and pn will not be Window if only ignoring the case of `<div> -> #shadow-root -> <frameset>`
    let kValue = "value", curEl: Element | null = element;
    for (;  parent     = curEl.parentNode    as Exclude<Element["parentNode"],    Window>
          , tempParent = curEl.parentElement as Exclude<Element["parentElement"], Window>
        ; curEl = tempParent as Element) {
      // here skips more cases than an "almost precise" solution, but it is enough
      if (tempParent !== parent && kValue in tempParent) {
        if (!parent || parent.nodeType !== kNode.ELEMENT_NODE) { break; }
        if (kValue in parent) { return; }
        tempParent = parent as Element;
      }
    }
    parent = parent || curEl;
  }
  // Document::nodeType is not changable (except overridden by an element like <img>), so the comparsion below is safe
  let type = parent.nodeType, s: Element["tagName"];
  // note: the below may change DOM trees,
  // so `dispatch` MUST NEVER throw. Otherwise a page might break
  if (type === kNode.ELEMENT_NODE) {
    parent !== root && call(Append, root, parent as Element);
    pushForDetached(
      IndexOf(allNodesForDetached = allNodesForDetached || call(getElementsByTagNameInEP, root, "*")
        , element));
  // Note: ignore the case that a plain #document-fragment has a fake .host
  }
  else if (type !== kNode.DOCUMENT_FRAGMENT_NODE) { /* empty */ }
  else if (unsafeDispatchCounter < InnerConsts.MaxUnsafeEventsInOneTick - 2) {
    if (Build.BTypes & ~BrowserType.Edge
        && (tempParent = (parent as TypeToAssert<DocumentFragment, ShadowRoot, "host">).host)) {
      parent = (!(Build.BTypes & BrowserType.Edge) && Build.MinCVer >= BrowserVer.Min$Node$$getRootNode || GetRootNode)
          && (tempParent as NonNullable<ShadowRoot["host"]>).shadowRoot // an open shadow tree
          && call(GetRootNode!, element, {composed: !0});
      if (parent && (parent === doc0 || (<NodeToElement> parent).nodeType === kNode.ELEMENT_NODE)
          && typeof (s = element.tagName) === "string") {
        parent !== doc0 && parent !== root && call(Append, root, parent);
        unsafeDispatchCounter++;
        dispatch(element, new CECls(kVOnClick, {detail: sec + s, composed: !0}));
      }
    } else {
      unsafeDispatchCounter++;
      dispatch(root, new DECls(kVOnClick, {relatedTarget: element}));
    }
  } else {
      toRegister.p(element);
      if (unsafeDispatchCounter < InnerConsts.MaxUnsafeEventsInOneTick + 1) {
        unsafeDispatchCounter = InnerConsts.MaxUnsafeEventsInOneTick + 1; // a fake value to run it only once a tick
        clearTimeout1(timer);
        timer = setTimeout_(next, InnerConsts.DelayForNextComplicatedCase);
      }
  }
}
function doRegister(fromAttrs: BOOL): void {
  if (nodeIndexListInDocument.length || nodeIndexListForDetached.length) {
    unsafeDispatchCounter++;
    dispatch(root, new CECls(kVOnClick, {
      detail: [nodeIndexListInDocument, nodeIndexListForDetached, fromAttrs]
    }));
    nodeIndexListInDocument.length = nodeIndexListForDetached.length = 0;
  }
// check lastChild, so avoid a mutation scope created in
// https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/dom/node.cc;l=2117;drc=06e052d21baaa5afc7c851ed43c6a90e53dc6156
  root.lastChild && (root.textContent = "");
}
function safeReRegister(element: Element, doc1: Document): void {
  const localAEL = doc1.addEventListener, localREL = doc1.removeEventListener;
  if (typeof localAEL == kFunc && typeof localREL == kFunc && localAEL !== myAEL) {
    isReRegistering = 1;
    try {
      // Note: here may break in case .addEventListener is an <embed> or overridden by host code
      call(localAEL, element, kEventName2, noop);
    } catch {}
    try {
      call(localREL, element, kEventName2, noop);
    } catch {}
    isReRegistering = 0;
  }
}
function executeCmd(eventOrDestroy?: Event): void {
  const detail: CommandEventDetail = eventOrDestroy && (eventOrDestroy as CustomEvent).detail,
  cmd: SecondLevelContentCmds | kContentCmd._fake = detail
      ? (detail >> kContentCmd.MaskedBitNumber) === sec ? detail & ((1 << kContentCmd.MaskedBitNumber) - 1)
        : kContentCmd._fake
      : eventOrDestroy ? kContentCmd._fake : kContentCmd.Destroy;
  // always stopProp even if the secret does not match, so that an attacker can not detect secret by enumerating numbers
  detail && call(StopProp, eventOrDestroy!);
  let len: number, i: number, tag: Element["tagName"]
  if (cmd < kContentCmd._minSuppressClickable) {
    if (!cmd || !root) { return; }
    call(Remove, root);
    allNodesInDocument = call(getElementsByTagNameInDoc, doc0, "*");
    len = allNodesInDocument.length, i = unsafeDispatchCounter = 0
    len = len < GlobalConsts.MinElementCountToStopScanOnClick || cmd === kContentCmd.ManuallyFindAllOnClick
        ? len : 0; // stop it
    for (; i < len; i++) {
      const el: Element | HTMLElement = allNodesInDocument[i];
      if (((el as HTMLElement).onclick || (el as HTMLElement).onmousedown) && !call(HasAttr, el, "onclick")
          && (tag = el.tagName) !== "a" && tag !== "button") { // ignore <button>s to iter faster
        pushInDocument(i);
      }
    }
    doRegister(1);
    allNodesInDocument = null;
    return;
  }
  toRegister.length = detectDisabled = 0;
  toRegister.p = setTimeout_ = noop;
  root = null as never;
  clearTimeout1(timer);
  timer = 1;
  rEL(kOnDomReady, doInit, !0);
}

toRegister.p = push as any, toRegister.s = toRegister.splice;
// only the below can affect outsides
curScript.remove();
ETP.addEventListener = myAEL;
FProto.toString = myToStr;
_listen(kOnDomReady, doInit, !0);

      }).toString() + ")();" /** need "toString()": {@link ../scripts/dependencies.js#patchExtendClick} */

// #endregion injected code

  if (isFirstTime) {
    if (Build.MinCVer < BrowserVer.MinEnsuredES6MethodFunction && Build.BTypes & BrowserType.Chrome &&
        appVer >= BrowserVer.MinEnsuredES6MethodFunction) {
      injected = injected.replace(<RegExpG> /: ?function \w+/g, "");
    }
    injected = injected.replace(GlobalConsts.MarkAcrossJSWorlds
        , "$&" + ((Math.random() * GlobalConsts.SecretRange + GlobalConsts.SecretBase) | 0));
    VApi.e = execute;
    setupEventListener(0, kHookRand, hook);
    setupEventListener(0, kVOnClick1, onClick);
  }
  /**
   * According to `V8CodeCache::ProduceCache` and `V8CodeCache::GetCompileOptions`
   *     in third_party/blink/renderer/bindings/core/v8/v8_code_cache.cc,
   *   and ScriptController::ExecuteScriptAndReturnValue
   *     in third_party/blink/renderer/bindings/core/v8/script_controller.cc,
   * inlined script are not cached for `v8::ScriptCompiler::kNoCacheBecauseInlineScript`.
   * But here it still uses the same script, just for my personal preference.
   */
  script.textContent = injected;
  script.type = "text/javascript";
  script.dataset.vimium = secret as number | string as string;
  if (!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinEnsured$ParentNode$$appendAndPrepend) {
    (docEl ? script : doc).prepend!.call(docEl || doc, script);
  } else {
    /** `appendChild` must be followed by /[\w.]*doc/: {@link ../Gulpfile.js#postUglify} */
    script.appendChild.call(docEl || doc, script)
  }
  script.dataset.vimium = "";
  if (!(Build.NDEBUG
        || BrowserVer.MinEnsuredNewScriptsFromExtensionOnSandboxedPage <= BrowserVer.NoRAFOrRICOnSandboxedPage)) {
    console.log("Assert error: Warning: may no timer function on sandbox page!");
  }
  if (Build.MinCVer <= BrowserVer.NoRAFOrRICOnSandboxedPage && Build.BTypes & BrowserType.Chrome
      && appVer === BrowserVer.NoRAFOrRICOnSandboxedPage) {
    /*#__INLINE__*/ set_allowRAF_(0)
    rAF_!(() => { /*#__INLINE__*/ set_allowRAF_(1) });
  }
  // not check MinEnsuredNewScriptsFromExtensionOnSandboxedPage
  // for the case JavaScript is disabled in CS: https://github.com/philc/vimium/issues/3187
  if (!script.parentNode) { // It succeeded to hook.
    // wait the inner listener of `start` to finish its work
    return OnDocLoaded_((): void => {
      // only for new versions of Chrome (and Edge);
      // CSP would block a <script> before MinEnsuredNewScriptsFromExtensionOnSandboxedPage
      // not check isFirstTime, to auto clean VApi.execute_
      !box ? execute(kContentCmd.DestroyForCSP) : isFirstTime && isAlive_ &&
      OnDocLoaded_(timeout_.bind(null, (): void => {
        isFirstResolve && dispatchCmd(kContentCmd.AutoFindAllOnClick);
        isFirstResolve = 0;
      }, GlobalConsts.ExtendClick_DelayToFindAll), 1);
    });
  }
  // else: CSP script-src before C68, CSP sandbox before C68 or JS-disabled-in-CS on C/E
  /*#__INLINE__*/ set_allowScripts_(0)
  script.remove();
  execute(kContentCmd.Destroy);
  if (!(Build.BTypes & BrowserType.Chrome)
      || Build.BTypes & ~BrowserType.ChromeOrFirefox && !appVer) {
    // on Edge (EdgeHTML), `setTimeout` and `requestAnimationFrame` work well
    return;
  }
  // ensured on Chrome
  const breakTotally = Build.MinCVer < BrowserVer.MinEventListenersFromExtensionOnSandboxedPage
      // still check appVer, so that treat it as a latest version if appVer parsing is failed
      && appVer && appVer < BrowserVer.MinEventListenersFromExtensionOnSandboxedPage;
  recordLog(kTip.logNotWorkOnSandboxed)
  if (Build.MinCVer < BrowserVer.MinEventListenersFromExtensionOnSandboxedPage && breakTotally) {
    return safeDestroy(1)
  }
  /*#__INLINE__*/
  replaceBrokenTimerFunc(function (func: (info?: TimerType.fake) => void, timeout: number): number {
    const cb = (): void => { func(TimerType.fake); };
    const rIC = Build.MinCVer < BrowserVer.MinEnsured$requestIdleCallback ? requestIdleCallback : 0 as const;
    // in case there's `$("#requestIdleCallback")`
    return Build.MinCVer <= BrowserVer.NoRAFOrRICOnSandboxedPage && Build.BTypes & BrowserType.Chrome && !allowRAF_
      ? (Promise.resolve().then(cb), 1)
      : timeout > 19
      && (Build.MinCVer >= BrowserVer.MinEnsured$requestIdleCallback || rIC)
      ? ((Build.MinCVer < BrowserVer.MinEnsured$requestIdleCallback ? rIC : requestIdleCallback
          ) as RequestIdleCallback)(cb, { timeout })
      : rAF_(cb)
      ;
  } as any)
})(grabBackFocus as boolean)

// #else: on Firefox

: (function (): void {
  const PEventTarget = (window as any).EventTarget as typeof EventTarget | undefined,
  Cls = PEventTarget && PEventTarget.prototype,
  wrappedCls = Cls && (Cls as any).wrappedJSObject as typeof Cls | undefined,
  _listen = wrappedCls && wrappedCls.addEventListener,
  newListen = function addEventListener(this: EventTarget, type: string
      , listener: EventListenerOrEventListenerObject): void {
    const a = this, args = arguments, len = args.length;
    len === 2 ? listen(a, type, listener) : len === 3 ? listen(a, type, listener, args[2])
      : (apply as (this: (this: EventTarget, ...args: any[]) => void
            , self: EventTarget, args: IArguments) => void
        ).call(_listen as (this: EventTarget, ...args: any[]) => void, a, args);
    if ((type === CLK || type === MDW || type === "dblclick") && alive
        && listener && !(a instanceof HTMLAnchorElement) && a instanceof Element) {
      if (!Build.NDEBUG) {
        clickable_.has(a) || resolved++;
        timer = timer || timeout_(resolve, GlobalConsts.ExtendClick_DelayToStartIteration);
      }
      clickable_.add(a);
    }
  },
  listen = newListen.call.bind<(this: (this: EventTarget,
          type: string, listener: EventListenerOrEventListenerObject, useCapture?: EventListenerOptions | boolean
        ) => 42 | void,
        self: EventTarget, name: string, listener: EventListenerOrEventListenerObject,
        opts?: EventListenerOptions | boolean
    ) => 42 | void>(_listen!), apply = newListen.apply,
  resolve = Build.NDEBUG ? 0 as never : (): void => {
    console.log("Vimium C: extend click: resolve %o in %o @t=%o ."
        , resolved
        , loc_.pathname.replace(<RegExpOne> /^.*(\/[^\/]+\/?)$/, "$1")
        , getTime() % 3600000);
    timer && clearTimeout_(timer);
    timer = resolved = 0;
  }

  let alive = true, timer = TimerID.None, resolved = 0;

  if (grabBackFocus) {
    if (typeof _listen === "function") {
      exportFunction(newListen, Cls!, { defineAs: newListen.name });
    }
    OnDocLoaded_((): void => {
      timeout_(function (): void {
        allHints && !hintKeyStatus.k && !hintKeyStatus.t && timeout_(coreHints.x, 34);
      }, GlobalConsts.ExtendClick_DelayToFindAll);
    }, 1);
  }
  VApi.e = (cmd: ValidContentCommands): void => {
    if (cmd > kContentCmd._minSuppressClickable - 1) {
      alive = false;
    }
  };
  if (Build.BTypes & ~BrowserType.Firefox ? !(doc instanceof HTMLDocument) : !isHTML_()) {
    // for <script>
    set_createElement_(doc.createElementNS.bind(doc, "http://www.w3.org/1999/xhtml") as typeof createElement_)
  }
})();
}
