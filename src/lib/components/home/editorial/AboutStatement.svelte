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
      <!-- Statement split into an ink lead + a muted geographic tail (two-tone). -->
      <p class="statement-big" data-rise use:rise>
        <span class="rise-inner"
          >{m.home_statement_lead()} <span class="soft">{m.home_statement_soft()}</span></span
        >
      </p>
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

  /* Muted geographic tail of the two-tone display statement. */
  .statement-big .soft {
    color: var(--muted);
  }

  @media (max-width: 1024px) {
    .statement-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
