<script lang="ts">
  import { asset } from '$app/paths';
  import { m } from '$i18n';
  import { rise } from '$lib/actions/editorialReveal';
</script>

<section class="statement">
  <img
    class="petroglyph petro-statement"
    src={asset('/assets/petroglyphs/3.svg')}
    alt=""
    aria-hidden="true"
  />
  <div class="wrap">
    <div class="statement-grid">
      <span class="eyebrow" data-rise use:rise>
        <span class="rise-inner">{m.footer_link_about()}</span>
      </span>
      <!-- home_meta_description — verbatim (single source string). -->
      <p class="statement-big" data-rise use:rise>
        <span class="rise-inner">{m.home_meta_description()}</span>
      </p>
    </div>

    <div class="statement-grid statement-partners">
      <span class="eyebrow" data-rise use:rise>
        <span class="rise-inner">{m.footer_supported_by()}</span>
      </span>
      <div class="st-support">
        <div class="st-logos">
          <span class="st-logo"><img src={asset('/assets/main-logo.svg')} alt="Jash-Muun" /></span>
          <span class="st-logo"><img src={asset('/assets/supporting-logo.svg')} alt="ALIPH" /></span
          >
          <span class="st-logo"
            ><img src={asset('/assets/eu-logo.svg')} alt="European Union" /></span
          >
        </div>
        <!-- footer_support_note — verbatim. -->
        <p class="st-note" data-rise use:rise>
          <span class="rise-inner">{m.footer_support_note()}</span>
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .statement {
    position: relative;
    padding: var(--section-pad) 0 clamp(28px, 3.5vw, 56px);
  }

  .wrap {
    position: relative;
    z-index: 1;
    max-width: var(--home-w);
    margin: 0 auto;
    padding: 0 var(--gutter);
  }

  .petro-statement {
    top: 27%;
    left: 1.5%;
    width: clamp(110px, 11vw, 175px);
    opacity: 0.06;
    transform: rotate(-7deg);
  }

  .eyebrow {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--ink-2);
  }

  .statement-grid {
    display: grid;
    grid-template-columns: 0.3fr 1fr;
    gap: clamp(24px, 5vw, 80px);
    align-items: start;
  }

  .statement-big {
    font-family: Jost, sans-serif;
    font-weight: 500;
    font-size: clamp(26px, 4vw, 56px);
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--ink);
    text-wrap: balance;
  }

  .statement-partners {
    margin-top: clamp(44px, 6vw, 88px);
    align-items: start;
  }

  .st-support {
    display: flex;
    flex-direction: column;
    gap: clamp(18px, 2vw, 28px);
  }

  .st-logos {
    display: flex;
    gap: clamp(32px, 4vw, 60px);
    align-items: center;
    flex-wrap: wrap;
  }

  .st-logo {
    height: clamp(48px, 5vw, 72px);
  }

  .st-logo img {
    height: 100%;
    width: auto;
    display: block;
  }

  .st-note {
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--muted);
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    .statement-grid {
      grid-template-columns: 1fr;
    }

    .statement-partners {
      margin-top: clamp(32px, 5vw, 56px);
    }

    .st-note {
      white-space: normal;
    }
  }

  @media (max-width: 640px) {
    .st-note {
      white-space: normal;
    }

    .st-logo {
      height: 44px;
    }
  }
</style>
